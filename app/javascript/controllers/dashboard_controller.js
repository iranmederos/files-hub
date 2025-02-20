import { Controller } from "@hotwired/stimulus"

export default class DashboardController extends Controller {
  static targets = ["title", "filesFeed", "empresasDropdown", "institucionDropdown"]
  connect() {
    if (!localStorage.getItem('token')) {
      alert('No estás logueado');
      window.location.href = '/';
    }

    this.token = localStorage.getItem('token');
    this.id = localStorage.getItem('id');

    this.loadInitialData();
  }

  async loadInitialData() {
    try {
      const data = await this.getFilesByCompanyAndInstitution(1, 1);
      const companies = await this.getCompaniesByUser();
      this.listCompanies(companies);
      const institutions = await this.getInstitutions();
      this.listInstitutions(institutions);
      this.buildDashboard(data);
    } catch (error) {
      console.error("Error en la carga de datos:", error);
    }
  }

  async getFilesByCompanyAndInstitution(company, institution) {
    const url = `api/v1/company_file/index_by?company_id=${company}&institution_id=${institution}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async getCompaniesByUser() {
    const url = `api/v1/company/index_by_user?user_id=${this.id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async getInstitutions() {
    const url = `api/v1/institution`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  listCompanies(companies) {
    if (this.empresasDropdownTarget.getElementsByTagName('option').length === 0) {
      companies.forEach(company => {
        this.empresasDropdownTarget.innerHTML += `<option value="${company.id}">${company.name}</option>`;
      });
    }
  }

  listInstitutions(institutions) {
    if (this.institucionDropdownTarget.getElementsByTagName('option').length === 0) {
      institutions.forEach(institution => {
        this.institucionDropdownTarget.innerHTML += `<option value="${institution.id}">${institution.name}</option>`;
      });
    }
  }

  buildDashboard(data) {
    const selectedText = this.institucionDropdownTarget.options[this.institucionDropdownTarget.selectedIndex].text;
    if (data.length === 0) {
      this.titleTarget.innerHTML = `No se encontraron archivos de ${selectedText}`;
    } else {
      this.titleTarget.innerHTML = `Archivos de ${selectedText}`;
    }
    this.makeFilesCards(data);
  }

  makeFilesCards(files) {
    this.filesFeedTarget.innerHTML = '';
    files.forEach(file => {
      this.filesFeedTarget.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card">
            <h5 class="card-header">#<span id="id-file">${file.id}</span> - ${file.name}</h5>
            <div class="card-body">
              <h5 class="card-title">${file.file_type}</h5>
              <p class="card-text">${file.updated_at}</p>
              <button class="btn btn-primary" data-action="click->dashboard#downloadFile">ver / descargar</button>
            </div>
          </div>
        </div>
      `;
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '';
  }

  changeEmpresa(event) {
    event.preventDefault();
    const empresaId = this.empresasDropdownTarget.value;
    const institucionId = this.institucionDropdownTarget.value;
    this.getFilesByCompanyAndInstitution(empresaId, institucionId).then(data => {
      this.buildDashboard(data);
    });
    bootstrap.Modal.getInstance(document.getElementById('empresasModal')).hide();
  }

  changeInstitucion(event) {
    event.preventDefault();
    const empresaId = this.empresasDropdownTarget.value;
    const institucionId = this.institucionDropdownTarget.value;
    this.getFilesByCompanyAndInstitution(empresaId, institucionId).then(data => {
      this.buildDashboard(data);
    });
    bootstrap.Modal.getInstance(document.getElementById('institucionModal')).hide();
  }

  downloadFile(event) {
    const button = event.currentTarget;
    const card = button.closest('.card');
    const id = card.querySelector('#id-file').textContent;
    fetch(`api/v1/company_file/show_file/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        // Open the file in a new tab
        window.open(url, '_blank');
        // Download the file
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'file';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error downloading file:', error));
  }
}