import { Controller } from "@hotwired/stimulus"

export default class ManageFilesController extends Controller {
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

    API_URL = "api/v1/company_file/";
    API_COMPANY_URL = "api/v1/company/index_by_user?user_id=";
    API_INSTITUTION_URL = "api/v1/institution";

    connect() {
        if (!localStorage.getItem('token') || !localStorage.getItem('id')) {
            alert('No estás logueado');
            window.location.href = '/';
        }

        this.token = localStorage.getItem('token');
        this.id = localStorage.getItem('id');
        this.idDelete = 0;

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

        this.addFormTarget.addEventListener('submit', this.addFile.bind(this));
        this.editFormTarget.addEventListener('submit', this.editFile.bind(this));
        this.deleteFormTarget.addEventListener('submit', this.deleteFile.bind(this));
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
        const files = await this.getFilesByCompanyAndInstitution(companyId, institutionId);
        this.listFiles(files);
    }

    listFiles(files) {
        this.bodyTableTarget.innerHTML = '';
        files.forEach(file => {
            this.bodyTableTarget.innerHTML += `
                <tr>
                    <td>${file.id}</td>
                    <td>${file.name}</td>
                    <td>${file.file_type}</td>
                    <td>${file.institution_id}</td>
                    <td>${file.updated_at}</td>
                    <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                            data-bs-target="#fileModalEdit" data-action="click->manage-files#getDataForEditModal">Editar</button>
                        <button class="btn btn-danger btn-sm" data-bs-toggle="modal"
                            data-bs-target="#fileModalDelete" data-action="click->manage-files#getIdFromTable">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    async getFilesByCompanyAndInstitution(company, institution) {
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

        document.getElementById('fileIdEdit').value = row.cells[0].textContent;
        document.getElementById('fileNameEdit').value = row.cells[1].textContent;
        document.getElementById('typeEdit').value = row.cells[2].textContent;
        document.getElementById('institutionDropdownEdit').value = row.cells[3].textContent;
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const row = button.parentElement.parentElement;
        this.idDelete = row.cells[0].textContent;
    }

    async addFile(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('company_file[name]', this.addFormTarget.fileNameAdd.value);
        formData.append('company_file[file_type]', this.addFormTarget.typeAdd.value);
        formData.append('company_file[institution_id]', this.addFormTarget.institutionDropdownAdd.value);
        formData.append('company_file[company_id]', this.companyDropdownTarget.value);

        const fileInput = document.getElementById('fileInput');
        if (fileInput.files.length > 0) {
            formData.append('company_file[file]', fileInput.files[0]);
        }

        await this.postAddFile(formData);

        this.addFormTarget.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('fileModalAdd'));
        modal.hide();
        window.location.reload();
    }

    async postAddFile(formData) {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.token
            },
            body: formData
        });
        return await response.json();
    }

    async editFile(event) {
        event.preventDefault();

        const file = {
            name: this.editFormTarget.fileNameEdit.value,
            file_type: this.editFormTarget.typeEdit.value,
            institution_id: this.editFormTarget.institutionDropdownEdit.value
        };
        const id = this.editFormTarget.fileIdEdit.value;

        await this.putEditFile(file, id);

        this.editFormTarget.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('fileModalEdit'));
        modal.hide();
        window.location.reload();
    }

    async putEditFile(file, id) {
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

    async deleteFile(event) {
        event.preventDefault();
        await this.requestDeleteFile(this.idDelete);
        const modal = bootstrap.Modal.getInstance(document.getElementById('fileModalDelete'));
        modal.hide();
        window.location.reload();
    }

    async requestDeleteFile(id) {
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