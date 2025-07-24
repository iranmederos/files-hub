import { Controller } from "@hotwired/stimulus";
import { checkLogin, getClaims } from "../helpers/utils_functions";

export default class ManageCompaniesController extends Controller {
    static targets = ["bodyTable", "addForm", "editForm", "deleteForm"];
    API_URL = "api/v1/company/";
    selectedCompanyId = null;

    connect() {
        checkLogin();
        this.token = localStorage.getItem('token');
        this.claims = getClaims(this.token);
        this.init();
    }

    async init() {
        try {
            await this.fillTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async fillTable() {
        try {
            const companies = await this.getCompanies();
            this.renderTable(companies);
        } catch (error) {
            this.handleError(error);
        }
    }

    renderTable(companies) {
        this.bodyTableTarget.innerHTML = '';
        if (!companies.length) {
            this.bodyTableTarget.innerHTML = '<tr><td colspan="7">No companies found.</td></tr>';
            return;
        }
        let rows = '';
        companies.forEach(company => {
            rows += `
                <tr data-company-id="${company.id}">
                    <td>${company.id}</td>
                    <td>${company.name}</td>
                    <td>${company.email}</td>
                    <td>${company.phone}</td>
                    <td>${company.username}</td>
                    <td>${company.user_id}</td>
                    <td>
                        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#companyModalEdit" data-action="click->manage-companies#getDataForEditModal" data-company-id="${company.id}">Editar</button>
                        <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#companyModalDelete" data-action="click->manage-companies#getIdFromTable" data-company-id="${company.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        this.bodyTableTarget.innerHTML = rows;
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const companyId = button.getAttribute('data-company-id');
        this.selectedCompanyId = companyId;
    }

    async deleteCompany(event) {
        if (event) event.preventDefault();
        try {
            const url = `${this.API_URL}${this.selectedCompanyId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Error deleting company');
            this.hideModal('companyModalDelete');
            await this.fillTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async editCompany(event) {
        event.preventDefault();
        const form = this.editFormTarget;
        const editedCompany = {
            name: form.querySelector('#companyNameEdit').value,
            email: form.querySelector('#companyEmailEdit').value,
            phone: form.querySelector('#companyPhoneEdit').value,
            user_id: form.querySelector('#companyUserEdit').value
        };
        const id = form.querySelector('#companyIdEdit').value;
        try {
            await this.putEditCompany(editedCompany, id);
            this.editFormTarget.reset();
            this.hideModal('companyModalEdit');
            await this.fillTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async putEditCompany(company, id) {
        const url = `${this.API_URL}${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({ company: company }),
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Error editing company');
        return await response.json();
    }

    getDataForEditModal(event) {
        const button = event.currentTarget;
        const row = button.closest('tr');
        const form = this.editFormTarget;
        form.querySelector('#companyIdEdit').value = row.cells[0].textContent;
        form.querySelector('#companyNameEdit').value = row.cells[1].textContent;
        form.querySelector('#companyEmailEdit').value = row.cells[2].textContent;
        form.querySelector('#companyPhoneEdit').value = row.cells[3].textContent;
        form.querySelector('#companyUserEdit').value = row.cells[5].textContent;
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

    async addCompany(event) {
        event.preventDefault();
        const addCompany = this.getDataForAddModal();
        try {
            await this.postAddCompany(addCompany);
            this.addFormTarget.reset();
            this.hideModal('companyModalAdd');
            await this.fillTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async postAddCompany(company) {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ company: company }),
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Error adding company');
        return await response.json();
    }

    async getCompanies() {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Error fetching companies');
        return await response.json();
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