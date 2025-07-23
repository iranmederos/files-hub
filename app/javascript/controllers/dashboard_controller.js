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
    this.loadInitialData().then(r => null);
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

  async loadInitialData() {
    try {
      backButton.style.display = "none";
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
      console.error("Error en la carga de datos:", error);
    }
  }

  async loadFiles(event) {
    try {
      backButton.style.display = "block";
      const folderId = event.params.folderId;
      if (!folderId){
        window.location.href = "/dashboard";
      }
      const files = await this.getFilesByCompanyAndInstitution(
        this.empresasDropdownTarget.value,
        this.institucionDropdownTarget.value,
        folderId,
      );
      this.buildDashboard(files, "file");
    } catch (error) {
      console.error("Error en la carga de datos:", error);
    }
  }

  async getFilesByCompanyAndInstitution(company, institution, folderId) {
    const url = `api/v1/company_file/index_by?company_id=${company}&institution_id=${institution}&folder_file_id=${folderId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  async getFoldersByCompanyAndInstitution(company, institution) {
    const url = `api/v1/folder_file/index_by?company_id=${company}&institution_id=${institution}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  async getCompaniesByUser() {
    const url = `api/v1/company/index_by_user?user_id=${this.claims.id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  async getInstitutions() {
    const url = `api/v1/institution`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  listCompanies(companies) {
    if (
      this.empresasDropdownTarget.getElementsByTagName("option").length === 0
    ) {
      companies.forEach((company) => {
        this.empresasDropdownTarget.innerHTML += `<option value="${company.id}">${company.name}</option>`;
      });
    }
  }

  listInstitutions(institutions) {
    if (
      this.institucionDropdownTarget.getElementsByTagName("option").length === 0
    ) {
      institutions.forEach((institution) => {
        this.institucionDropdownTarget.innerHTML += `<option value="${institution.id}">${institution.name}</option>`;
      });
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
    files.forEach((file) => {
      this.FeedTarget.innerHTML += `
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

  makeFolderFilesCards(folderFiles) {
    this.FeedTarget.innerHTML = "";
    folderFiles.forEach((file) => {
      this.FeedTarget.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card">
            <h5 class="card-header">#<span id="id-file">${file.id}</span> - ${file.name}</h5>
            <div class="card-body">
              <h5 class="card-title">Cantidad: ${file.size}</h5>
              <p class="card-text">${file.updated_at}</p>
              <button class="btn btn-primary" data-action="click->dashboard#loadFiles" data-dashboard-folder-id-param="${file.id}">ver carpeta</button>
            </div>
          </div>
        </div>
      `;
    });
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
    bootstrap.Modal.getInstance(
      document.getElementById("empresasModal"),
    ).hide();
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
    bootstrap.Modal.getInstance(
      document.getElementById("institucionModal"),
    ).hide();
  }

  downloadFile(event) {
    const button = event.currentTarget;
    const card = button.closest(".card");
    const id = card.querySelector("#id-file").textContent;

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
      .catch((error) => console.error("Error downloading file:", error))
      .finally(() => {
        // Remove loading animation
        button.disabled = false;
        if (loading.parentNode) loading.parentNode.removeChild(loading);
      });
  }
}
