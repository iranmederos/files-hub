import { Controller } from "@hotwired/stimulus";
import { checkLogin, getClaims } from "../helpers/utils_functions";

export default class DashboardController extends Controller {
  static targets = [
    "title",
    "Feed",
    "username",
    "empresasDropdown",
    "institucionDropdown",
    "adminMenu",
    "clientMenu",
    "backButton",
  ];

  connect() {
    checkLogin();
    this.token = localStorage.getItem("token");
    this.claims = getClaims(this.token);
    this.writeUsername();
    this.panel();
    this.loadInitialData();
    this.empresasDropdownTarget.addEventListener('change', this.saveEmpresaSelection.bind(this));
    this.institucionDropdownTarget.addEventListener('change', this.saveInstitucionSelection.bind(this));
    if (this.backButtonTarget) {
      this.backButtonTarget.addEventListener('click', this.handleBackButtonClick.bind(this));
    }
  }

  panel() {
    if (this.claims.roles === "admin") {
      this.adminMenuTarget.style.display = "block";
      this.clientMenuTarget.style.display = "none";
    } else {
      this.adminMenuTarget.style.display = "none";
      this.clientMenuTarget.style.display = "block";
    }
  }

  writeUsername() {
    this.usernameTarget.innerHTML = this.claims.name;
  }

  saveEmpresaSelection() {
    localStorage.setItem('selectedEmpresa', this.empresasDropdownTarget.value);
  }

  saveInstitucionSelection() {
    localStorage.setItem('selectedInstitucion', this.institucionDropdownTarget.value);
  }

  async loadInitialData() {
    try {
      if (this.backButtonTarget) {
        this.backButtonTarget.style.display = "none";
      }
      this.FeedTarget.innerHTML = "";
      const companies = await this.getCompaniesByUser();
      const institutions = await this.getInstitutions();
      this.listCompanies(companies);
      this.listInstitutions(institutions);
      const folders = await this.getFoldersByCompanyAndInstitution(
        this.empresasDropdownTarget.value,
        this.institucionDropdownTarget.value,
      );
      this.buildDashboard(folders);
    } catch (error) {
      this.handleError(error);
    }
  }

  async loadFiles(event) {
    try {
      if (this.backButtonTarget) {
        this.backButtonTarget.style.display = "block";
      }
      const folderId = event.params.folderId;
      if (!folderId) {
        window.location.href = "/dashboard";
      }
      const files = await this.getFilesByCompanyAndInstitution(
        this.empresasDropdownTarget.value,
        this.institucionDropdownTarget.value,
        folderId,
      );
      this.buildDashboard(files, "file");
    } catch (error) {
      this.handleError(error);
    }
  }

  handleBackButtonClick(event) {
    event.preventDefault();
    this.loadInitialData();
    if (this.backButtonTarget) {
      this.backButtonTarget.style.display = "none";
    }
  }

  async getFilesByCompanyAndInstitution(company, institution, folderId) {
    try {
      const url = `api/v1/company_file/index_by?company_id=${company}&institution_id=${institution}&folder_file_id=${folderId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('Error fetching files');
      return await response.json();
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async getFoldersByCompanyAndInstitution(company, institution) {
    try {
      const url = `api/v1/folder_file/index_by?company_id=${company}&institution_id=${institution}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('Error fetching folders');
      return await response.json();
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async getCompaniesByUser() {
    try {
      const url = `api/v1/company/index_by_user?user_id=${this.claims.id}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('Error fetching companies');
      return await response.json();
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async getInstitutions() {
    try {
      const url = `api/v1/institution`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('Error fetching institutions');
      return await response.json();
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  listCompanies(companies) {
    this.empresasDropdownTarget.innerHTML = '';
    let options = '';
    companies.forEach((company) => {
      options += `<option value="${company.id}">${company.name}</option>`;
    });
    this.empresasDropdownTarget.innerHTML = options;
    // Restore selection
    const savedEmpresa = localStorage.getItem('selectedEmpresa');
    if (savedEmpresa) {
      this.empresasDropdownTarget.value = savedEmpresa;
    }
  }

  listInstitutions(institutions) {
    this.institucionDropdownTarget.innerHTML = '';
    let options = '';
    institutions.forEach((institution) => {
      options += `<option value="${institution.id}">${institution.name}</option>`;
    });
    this.institucionDropdownTarget.innerHTML = options;
    // Restore selection
    const savedInstitucion = localStorage.getItem('selectedInstitucion');
    if (savedInstitucion) {
      this.institucionDropdownTarget.value = savedInstitucion;
    }
  }

  buildDashboard(data, type = "folder") {
    const selectedText =
      this.institucionDropdownTarget.options[
        this.institucionDropdownTarget.selectedIndex
      ].text;
    if (data.length === 0) {
      this.titleTarget.innerHTML = `No se encontraron archivos de ${selectedText}`;
    } else {
      this.titleTarget.innerHTML = `Archivos de ${selectedText}`;
    }
    if (type === "folder") {
      this.makeFolderFilesCards(data);
    } else if (type === "file") {
      this.makeFilesCards(data);
    }
  }

  makeFilesCards(files) {
    this.FeedTarget.innerHTML = "";
    let cards = '';
    files.forEach((file) => {
      cards += `
        <div class="col-md-4 mb-4">
          <div class="card" data-file-id="${file.id}">
            <h5 class="card-header">#<span class="id-file">${file.id}</span> - ${file.name}</h5>
            <div class="card-body">
              <h5 class="card-title">${file.file_type}</h5>
              <p class="card-text">${file.updated_at}</p>
              <button class="btn btn-primary" data-action="click->dashboard#downloadFile">ver / descargar</button>
            </div>
          </div>
        </div>
      `;
    });
    this.FeedTarget.innerHTML = cards;
  }

  makeFolderFilesCards(folderFiles) {
    this.FeedTarget.innerHTML = "";
    let cards = '';
    folderFiles.forEach((file) => {
      cards += `
        <div class="col-md-4 mb-4">
          <div class="card" data-folder-id="${file.id}">
            <h5 class="card-header">#<span class="id-file">${file.id}</span> - ${file.name}</h5>
            <div class="card-body">
              <h5 class="card-title">Cantidad: ${file.size}</h5>
              <p class="card-text">${file.updated_at}</p>
              <button class="btn btn-primary" data-action="click->dashboard#loadFiles" data-dashboard-folder-id-param="${file.id}">ver carpeta</button>
            </div>
          </div>
        </div>
      `;
    });
    this.FeedTarget.innerHTML = cards;
  }

  logout() {
    localStorage.clear();
    window.location.href = "/";
  }

  changeEmpresa(event) {
    event.preventDefault();
    const empresaId = this.empresasDropdownTarget.value;
    const institucionId = this.institucionDropdownTarget.value;
    this.getFoldersByCompanyAndInstitution(empresaId, institucionId).then(
      (data) => {
        this.buildDashboard(data);
      },
    );
    this.hideModal("empresasModal");
  }

  changeInstitucion(event) {
    event.preventDefault();
    const empresaId = this.empresasDropdownTarget.value;
    const institucionId = this.institucionDropdownTarget.value;
    this.getFoldersByCompanyAndInstitution(empresaId, institucionId).then(
      (data) => {
        this.buildDashboard(data);
      },
    );
    this.hideModal("institucionModal");
  }

  downloadFile(event) {
    const button = event.currentTarget;
    const card = button.closest(".card");
    const id = card.querySelector(".id-file").textContent;

    // Show loading animation
    const loading = document.createElement("div");
    loading.className = "spinner-border text-secondary";
    loading.role = "status";
    loading.style.display = "inline-block";
    loading.style.marginLeft = "10px";
    loading.innerHTML = '<span class="visually-hidden">Loading...</span>';
    button.disabled = true;
    button.appendChild(loading);

    fetch(`api/v1/company_file/show_file/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "file";
        document.body.appendChild(a);

        if (blob.type === "application/pdf") {
          window.open(url, "_blank");
        } else {
          a.click();
        }

        window.URL.revokeObjectURL(url);
      })
      .catch((error) => this.handleError(error))
      .finally(() => {
        // Remove loading animation
        button.disabled = false;
        if (loading.parentNode) loading.parentNode.removeChild(loading);
      });
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  hideModal(modalId) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  }

  handleError(error) {
    console.error(error);
    alert(error.message || 'An error occurred');
  }
}
