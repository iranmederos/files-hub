import { Controller } from "@hotwired/stimulus"

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
        if (!localStorage.getItem('token') || !localStorage.getItem('id')) {
            alert('No estás logueado');
            window.location.href = '/';
        }

        this.token = localStorage.getItem('token');
        this.id = localStorage.getItem('id');
        this.elementId = 0;

        this.init();
    }

    async init() {
        await this.fillCompaniesDropdown();
        await this.fillInstitutionsDropdown();
        await this.fillBodyTable();

        this.companyDropdownTarget.addEventListener('change', async () => {
            await this.fillBodyTable();
        });

        this.institutionDropdownTarget.addEventListener('change', async () => {
            await this.fillBodyTable();
        });

        this.addFormTarget.addEventListener('submit', this.addFolder.bind(this));
        this.editFormTarget.addEventListener('submit', this.editFolder.bind(this));
        this.deleteFormTarget.addEventListener('submit', this.deleteFolder.bind(this));
    }

    async getCompanies() {
        const url = this.API_COMPANY_URL + this.id;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    listCompanies(companies) {
        if (this.companyDropdownTarget.getElementsByTagName('option').length === 0) {
            companies.forEach(company => {
                this.companyDropdownTarget.innerHTML += `
                    <option value="${company.id}">${company.name}</option>
                `;
            });
        }
    }

    async fillCompaniesDropdown() {
        const companies = await this.getCompanies();
        this.listCompanies(companies);
    }

    async fillBodyTable() {
        const companyId = this.companyDropdownTarget.value;
        const institutionId = this.institutionDropdownTarget.value;
        const folders = await this.getFoldersByCompanyAndInstitution(companyId, institutionId);
        this.listFolders(folders);
    }

    listFolders(folders) {
        this.bodyTableTarget.innerHTML = '';
        folders.forEach(folder => {
            this.bodyTableTarget.innerHTML += `
                <tr>
                    <td>${folder.id}</td>
                    <td>${folder.name}</td>
                    <td>${folder.institution_id}</td>
                    <td>${folder.updated_at}</td>
                    <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                            data-bs-target="#folderModalEdit" data-action="click->manage-folders#getDataForEditModal">Editar</button>
                            
                        <button class="btn btn-secondary btn-sm" data-action="click->manage-folders#redirectToFiles">Ver</button>
                       
                        <button class="btn btn-danger btn-sm" data-bs-toggle="modal"
                            data-bs-target="#folderModalDelete" data-action="click->manage-folders#getIdFromTable">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    redirectToFiles(event) {
        this.getIdFromTable(event)
        localStorage.setItem('folderId', this.elementId);
        window.location.href = '/manage_files';
    }

    async getFoldersByCompanyAndInstitution(company, institution) {
        const url = this.API_URL + `index_by?company_id=${company}&institution_id=${institution}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    async getInstitutions() {
        const url = this.API_INSTITUTION_URL;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    listInstitutions(institutions, dropdown) {
        if (dropdown.getElementsByTagName('option').length === 0) {
            institutions.forEach(institution => {
                dropdown.innerHTML += `
                    <option value="${institution.id}">${institution.name}</option>
                `;
            });
        }
    }

    async fillInstitutionsDropdown() {
        const institutions = await this.getInstitutions();
        this.listInstitutions(institutions, this.institutionDropdownTarget);
        this.listInstitutions(institutions, this.institutionDropdownEditTarget);
        this.listInstitutions(institutions, this.institutionDropdownAddTarget);
    }

    getDataForEditModal(event) {
        const button = event.currentTarget;
        const row = button.closest('tr');

        document.getElementById('folderIdEdit').value = row.cells[0].textContent;
        document.getElementById('folderNameEdit').value = row.cells[1].textContent;
        document.getElementById('typeEdit').value = row.cells[2].textContent;
        document.getElementById('institutionDropdownEdit').value = row.cells[3].textContent;
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const row = button.parentElement.parentElement;
        this.elementId = row.cells[0].textContent;
    }

    async addFolder(event) {
        event.preventDefault();
        let folder_file = {
            name: this.addFormTarget.folderNameAdd.value,
            company_id: this.companyDropdownTarget.value,
            institution_id: this.institutionDropdownTarget.value,
        }

        await this.postAddFolder(folder_file);

        this.addFormTarget.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('folderModalAdd'));
        modal.hide();
        window.location.reload();
    }

    async postAddFolder(data) {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({folder_file: data})
        });
        return await response.json();
    }

    async editFolder(event) {
        event.preventDefault();

        const file = {
            name: this.editFormTarget.folderNameAdd.value,
            file_type: this.editFormTarget.typeEdit.value,
            institution_id: this.editFormTarget.institutionDropdownEdit.value
        };
        const id = this.editFormTarget.fileIdEdit.value;

        await this.putEditFolder(file, id);

        this.editFormTarget.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('folderModalEdit'));
        modal.hide();
        window.location.reload();
    }

    async putEditFolder(file, id) {
        const url = this.API_URL + `${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(file)
        });
        return await response.json();
    }

    async deleteFolder(event) {
        event.preventDefault();
        await this.requestDeleteFolder(this.elementId);
        const modal = bootstrap.Modal.getInstance(document.getElementById('folderModalDelete'));
        modal.hide();
        window.location.reload();
    }

    async requestDeleteFolder(id) {
        const url = this.API_URL + `${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const message = await response.text();
            console.log(message); // "Resource Deleted Successfully"
        } else {
            const error = await response.text();
            console.error(error); // Handle the error message
        }
    }
}