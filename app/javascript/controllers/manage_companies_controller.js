import { Controller } from "@hotwired/stimulus"

export default class ManageCompaniesController extends Controller {
    static targets = ["bodyTable", "addForm", "editForm", "deleteForm"];
    API_URL = "api/v1/company/"
    idDelete = null;

    connect() {
        if (!localStorage.getItem('token') || !localStorage.getItem('id')) {
            alert('No estás logueado');
            window.location.href = '/';
        }

        this.token = localStorage.getItem('token');
        this.id = localStorage.getItem('id');

        this.getCompanies().then(data => {
            this.fillTable(data);
        });
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const row = button.parentElement.parentElement;
        this.idDelete = row.cells[0].textContent;
    }

    async deleteCompany() {
        const url = `${this.API_URL}${this.idDelete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + this.token
            }
        });
        const data = await response.json();
        if (data) {
            window.location = '/manage_companies';
        } else {
            alert('Error al eliminar empresa');
        }
    }

    async editCompany() {
        event.preventDefault();
        const form = this.editFormTarget;
        const editedCompany = {
            name: form.querySelector('#companyNameEdit').value,
            email: form.querySelector('#companyEmailEdit').value,
            phone: form.querySelector('#companyPhoneEdit').value,
            user: form.querySelector('#companyUserEdit').value
        };
        let id = form.querySelector('#companyIdEdit').value;

        const url = `${this.API_URL}${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({company: editedCompany}),
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data) {
            window.location = '/manage_companies';
        } else {
            alert('Error al editar empresa');
        }
    }

    async getCompanies() {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.token
            }
        });
        return response.json();
    }

    fillTable(data) {
        this.bodyTableTarget.innerHTML = '';
        data.forEach(company => {
            this.bodyTableTarget.innerHTML += `
            <tr>
                <td>${company.id}</td>
                <td>${company.name}</td>
                <td>${company.email}</td>
                <td>${company.phone}</td>
                <td>${company.user_id}</td>
                <td>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#companyModalEdit" data-action="click->manage-companies#getDataForEditModal">Editar</button>
                    <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#companyModalDelete" data-action="click->manage-companies#getIdFromTable">Eliminar</button>
                </td>
            </tr>
            `;
        });
    }

    getDataForEditModal(event) {
        const button = event.currentTarget;
        const row = button.parentElement.parentElement;
        const form = this.editFormTarget;
        form.querySelector('#companyIdEdit').value = row.cells[0].textContent;
        form.querySelector('#companyNameEdit').value = row.cells[1].textContent;
        form.querySelector('#companyEmailEdit').value = row.cells[2].textContent;
        form.querySelector('#companyPhoneEdit').value = row.cells[3].textContent;
        form.querySelector('#companyUserEdit').value = row.cells[4].textContent;
    }

    getDataForAddModal() {
        const form = this.addFormTarget;
        return {
            name: form.querySelector('#companyNameAdd').value,
            email: form.querySelector('#companyEmailAdd').value,
            phone: form.querySelector('#companyPhoneAdd').value,
            user_id: form.querySelector('#companyUserAdd').value
        };
    }

    async addCompany() {
        event.preventDefault();
        const addCompany = this.getDataForAddModal();
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({company: addCompany}),
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data) {
            window.location = '/manage_companies';
        } else {
            alert('Error al agregar empresa');
        }
    }


}