import { Controller } from "@hotwired/stimulus"
import { getClaims } from "../helpers/utils_functions";

export default class ManageFoldersController extends Controller {
    static targets = [
        "bodyTable",
        "addForm",
        "editForm",
        "deleteForm",
        "companyDropdown",
        "institutionDropdown",
        "institutionDropdownEdit",
        "institutionDropdownAdd"
    ]

    API_URL = "api/v1/folder_file/";
    API_COMPANY_URL = "api/v1/company/index_by_user?user_id=";
    API_INSTITUTION_URL = "api/v1/institution";

    connect() {
        if (!localStorage.getItem('token')){
            alert('No estás logueado');
            window.location.href = '/';
        }

        this.token = localStorage.getItem('token');
        this.claims = getClaims(this.token);
        this.selectedFolderId = null;

        this.init();
    }

    async init() {
        try {
            await this.fillCompaniesDropdown();
            await this.fillInstitutionsDropdown();
            await this.fillBodyTable();

            this.companyDropdownTarget.addEventListener('change', this.fillBodyTable.bind(this));
            this.institutionDropdownTarget.addEventListener('change', this.fillBodyTable.bind(this));

            this.addFormTarget.addEventListener('submit', this.addFolder.bind(this));
            this.editFormTarget.addEventListener('submit', this.editFolder.bind(this));
            this.deleteFormTarget.addEventListener('submit', this.deleteFolder.bind(this));
        } catch (error) {
            this.handleError(error);
        }
    }

    async getCompanies() {
        try {
            const url = this.API_COMPANY_URL + this.claims.id;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Error fetching companies');
            return await response.json();
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    listCompanies(companies) {
        this.companyDropdownTarget.innerHTML = '';
        let options = '';
        companies.forEach(company => {
            options += `<option value="${company.id}">${company.name}</option>`;
        });
        this.companyDropdownTarget.innerHTML = options;
    }

    async fillCompaniesDropdown() {
        const companies = await this.getCompanies();
        this.listCompanies(companies);
    }

    async fillBodyTable() {
        try {
            const companyId = this.companyDropdownTarget.value;
            const institutionId = this.institutionDropdownTarget.value;
            const folders = await this.getFoldersByCompanyAndInstitution(companyId, institutionId);
            this.listFolders(folders);
        } catch (error) {
            this.handleError(error);
        }
    }

    listFolders(folders) {
        this.bodyTableTarget.innerHTML = '';
        if (!folders.length) {
            this.bodyTableTarget.innerHTML = '<tr><td colspan="5">No folders found.</td></tr>';
            return;
        }
        let rows = '';
        folders.forEach(folder => {
            rows += `
                <tr data-folder-id="${folder.id}">
                    <td>${folder.id}</td>
                    <td>${folder.name}</td>
                    <td>${folder.institution_id}</td>
                    <td>${folder.updated_at}</td>
                    <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                            data-bs-target="#folderModalEdit" data-action="click->manage-folders#getDataForEditModal" data-folder-id="${folder.id}">Editar</button>
                        <button class="btn btn-secondary btn-sm" data-action="click->manage-folders#redirectToFiles" data-folder-id="${folder.id}">Ver</button>
                        <button class="btn btn-danger btn-sm" data-bs-toggle="modal"
                            data-bs-target="#folderModalDelete" data-action="click->manage-folders#getIdFromTable" data-folder-id="${folder.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        this.bodyTableTarget.innerHTML = rows;
    }

    redirectToFiles(event) {
        const folderId = event.currentTarget.getAttribute('data-folder-id');
        localStorage.setItem('folderId', folderId);
        window.location.href = '/manage_files';
    }

    async getFoldersByCompanyAndInstitution(company, institution) {
        try {
            const url = this.API_URL + `index_by?company_id=${company}&institution_id=${institution}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Error fetching folders');
            return await response.json();
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async getInstitutions() {
        try {
            const url = this.API_INSTITUTION_URL;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Error fetching institutions');
            return await response.json();
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    listInstitutions(institutions, dropdown) {
        dropdown.innerHTML = '';
        let options = '';
        institutions.forEach(institution => {
            options += `<option value="${institution.id}">${institution.name}</option>`;
        });
        dropdown.innerHTML = options;
    }

    async fillInstitutionsDropdown() {
        const institutions = await this.getInstitutions();
        this.listInstitutions(institutions, this.institutionDropdownTarget);
        this.listInstitutions(institutions, this.institutionDropdownEditTarget);
        this.listInstitutions(institutions, this.institutionDropdownAddTarget);
    }

    getDataForEditModal(event) {
        const button = event.currentTarget;
        const folderId = button.getAttribute('data-folder-id');
        const row = button.closest('tr');
        document.getElementById('folderIdEdit').value = folderId;
        document.getElementById('folderNameEdit').value = row.cells[1].textContent;
        document.getElementById('typeEdit').value = row.cells[2].textContent;
        document.getElementById('institutionDropdownEdit').value = row.cells[2].textContent;
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const folderId = button.getAttribute('data-folder-id');
        this.selectedFolderId = folderId;
    }

    async addFolder(event) {
        event.preventDefault();
        const folder_file = {
            name: this.addFormTarget.folderNameAdd.value,
            company_id: this.companyDropdownTarget.value,
            institution_id: this.institutionDropdownTarget.value,
        };
        try {
            await this.postAddFolder(folder_file);
            this.addFormTarget.reset();
            this.hideModal('folderModalAdd');
            await this.fillBodyTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async postAddFolder(data) {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({folder_file: data})
        });
        if (!response.ok) throw new Error('Error adding folder');
        return await response.json();
    }

    async editFolder(event) {
        event.preventDefault();
        const folder = {
            name: this.editFormTarget.folderNameEdit.value,
            folder_type: this.editFormTarget.typeEdit.value,
            institution_id: this.editFormTarget.institutionDropdownEdit.value
        };
        const id = this.editFormTarget.folderIdEdit.value;
        try {
            await this.putEditFolder(folder, id);
            this.editFormTarget.reset();
            this.hideModal('folderModalEdit');
            await this.fillBodyTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async putEditFolder(folder, id) {
        const url = this.API_URL + `${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({folder_file: folder})
        });
        if (!response.ok) throw new Error('Error editing folder');
        return await response.json();
    }

    async deleteFolder(event) {
        event.preventDefault();
        try {
            await this.requestDeleteFolder(this.selectedFolderId);
            this.hideModal('folderModalDelete');
            await this.fillBodyTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async requestDeleteFolder(id) {
        const url = this.API_URL + `${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Error deleting folder');
        return await response.text();
    }

    getHeaders() {
        return {
            'Authorization': 'Bearer ' + this.token,
            'Content-Type': 'application/json'
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
        // Centralized error handler
        console.error(error);
        alert(error.message || 'An error occurred');
    }
}