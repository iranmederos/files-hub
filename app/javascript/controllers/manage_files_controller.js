import { Controller } from "@hotwired/stimulus"
import { getClaims, checkLogin } from "../helpers/utils_functions";

export default class ManageFilesController extends Controller {
    static targets = [
        "bodyTable",
        "addForm",
        "editForm",
        "deleteForm"
    ];

    API_URL = "api/v1/company_file/";
    API_INSTITUTION_URL = "api/v1/institution";

    connect() {
        checkLogin();
        this.token = localStorage.getItem('token');
        this.claims = getClaims(this.token);
        this.selectedFileId = null;
        this.init();
    }

    async init() {
        try {
            await this.fillBodyTable();
            this.addFormTarget.addEventListener('submit', this.addFile.bind(this));
            this.editFormTarget.addEventListener('submit', this.editFile.bind(this));
            this.deleteFormTarget.addEventListener('submit', this.deleteFile.bind(this));
        } catch (error) {
            this.handleError(error);
        }
    }

    async fillBodyTable() {
        try {
            let folderId = localStorage.getItem('folderId');
            const files = await this.getFilesByFolder(folderId);
            this.listFiles(files);
        } catch (error) {
            this.handleError(error);
        }
    }

    listFiles(files) {
        this.bodyTableTarget.innerHTML = '';
        if (!files.length) {
            this.bodyTableTarget.innerHTML = '<tr><td colspan="6">No files found.</td></tr>';
            return;
        }
        let rows = '';
        files.forEach(file => {
            rows += `
                <tr data-file-id="${file.id}">
                    <td>${file.id}</td>
                    <td>${file.name}</td>
                    <td>${file.file_type}</td>
                    <td>${file.institution_id}</td>
                    <td>${file.updated_at}</td>
                    <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                            data-bs-target="#fileModalEdit" data-action="click->manage-files#getDataForEditModal" data-file-id="${file.id}">Editar</button>
                        <button class="btn btn-danger btn-sm" data-bs-toggle="modal"
                            data-bs-target="#fileModalDelete" data-action="click->manage-files#getIdFromTable" data-file-id="${file.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        this.bodyTableTarget.innerHTML = rows;
    }

    async getFilesByFolder(folderId) {
        try {
            const url = this.API_URL + `index_by?folder_file_id=${folderId}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Error fetching files');
            return await response.json();
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    getDataForEditModal(event) {
        const button = event.currentTarget;
        const fileId = button.getAttribute('data-file-id');
        const row = button.closest('tr');
        document.getElementById('fileIdEdit').value = fileId;
        document.getElementById('fileNameEdit').value = row.cells[1].textContent;
        document.getElementById('typeEdit').value = row.cells[2].textContent;
        document.getElementById('institutionDropdownEdit').value = row.cells[3].textContent;
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const fileId = button.getAttribute('data-file-id');
        this.selectedFileId = fileId;
    }

    async addFile(event) {
        event.preventDefault();
        const button = this.addFormTarget.querySelector('button[type="submit"]');
        const loading = document.createElement("div");
        loading.className = "spinner-border text-secondary";
        loading.role = "status";
        loading.style.display = "inline-block";
        loading.style.marginLeft = "10px";
        loading.innerHTML = '<span class="visually-hidden">Loading...</span>';
        button.disabled = true;
        button.appendChild(loading);

        const formData = new FormData();
        formData.append('company_file[name]', this.addFormTarget.fileNameAdd.value);
        formData.append('company_file[file_type]', this.addFormTarget.typeAdd.value);
        formData.append('company_file[folder_file_id]', localStorage.getItem('folderId'));

        const fileInput = document.getElementById('fileInput');
        if (fileInput.files.length > 0) {
            formData.append('company_file[file]', fileInput.files[0]);
        }
        try {
            await this.postAddFile(formData);
            this.addFormTarget.reset();
            this.hideModal('fileModalAdd');
            await this.fillBodyTable();
        } catch (error) {
            this.handleError(error);
        } finally {
            button.disabled = false;
            if (button.contains(loading)) button.removeChild(loading);
        }
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
        if (!response.ok) throw new Error('Error adding file');
        return await response.json();
    }

    async editFile(event) {
        event.preventDefault();
        const file = {
            name: this.editFormTarget.fileNameEdit.value,
            file_type: this.editFormTarget.typeEdit.value,
            folder_file_id: localStorage.getItem('folderId')
        };
        const id = this.editFormTarget.fileIdEdit.value;
        try {
            await this.putEditFile(file, id);
            this.editFormTarget.reset();
            this.hideModal('fileModalEdit');
            await this.fillBodyTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async putEditFile(file, id) {
        const url = this.API_URL + `${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(file)
        });
        if (!response.ok) throw new Error('Error editing file');
        return await response.json();
    }

    async deleteFile(event) {
        event.preventDefault();
        try {
            await this.requestDeleteFile(this.selectedFileId);
            this.hideModal('fileModalDelete');
            await this.fillBodyTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async requestDeleteFile(id) {
        const url = this.API_URL + `${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Error deleting file');
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