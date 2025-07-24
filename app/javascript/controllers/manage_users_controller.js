import { Controller } from "@hotwired/stimulus";
import { getClaims, checkLogin } from "../helpers/utils_functions";

export default class ManageUsersController extends Controller {
    static targets = ["bodyTable", "addForm", "editForm", "deleteForm"];
    API_URL = "api/v1/users/";
    selectedUserId = null;

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
            const users = await this.getUsers();
            this.renderTable(users);
        } catch (error) {
            this.handleError(error);
        }
    }

    renderTable(users) {
        this.bodyTableTarget.innerHTML = '';
        if (!users.length) {
            this.bodyTableTarget.innerHTML = '<tr><td colspan="7">No users found.</td></tr>';
            return;
        }
        let rows = '';
        users.forEach(user => {
            let fechaAlta = new Date(user.created_at);
            let formattedDate = ('0' + fechaAlta.getDate()).slice(-2) + '-' + ('0' + (fechaAlta.getMonth() + 1)).slice(-2) + '-' + fechaAlta.getFullYear();
            rows += `
                <tr data-user-id="${user.id}">
                    <td>${user.id}</td>
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.email}</td>
                    <td>${formattedDate}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                            data-bs-target="#userModalEdit" data-action="click->manage-users#getDataForEditModal" data-user-id="${user.id}">Editar</button>
                        <button class="btn btn-danger btn-sm" data-bs-toggle="modal" data-action="click->manage-users#getIdFromTable"
                            data-bs-target="#userModalDelete" data-user-id="${user.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        this.bodyTableTarget.innerHTML = rows;
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const userId = button.getAttribute('data-user-id');
        this.selectedUserId = userId;
    }

    async deleteUser(event) {
        if (event) event.preventDefault();
        try {
            const url = `${this.API_URL}${this.selectedUserId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Error deleting user');
            this.hideModal('userModalDelete');
            await this.fillTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async editUser(event) {
        event.preventDefault();
        const form = this.editFormTarget;
        const editedUser = {
            first_name: form.querySelector('#userNameEdit').value,
            last_name: form.querySelector('#userLastNameEdit').value,
            email: form.querySelector('#userEmailEdit').value,
            password: form.querySelector('#userPasswordEdit').value,
            role_ids: [form.querySelector('#userRoleEdit').value]
        };
        const id = form.querySelector('#userIdEdit').value;
        try {
            await this.putEditUser(editedUser, id);
            this.editFormTarget.reset();
            this.hideModal('userModalEdit');
            await this.fillTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async putEditUser(user, id) {
        const url = `${this.API_URL}${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({ user: user }),
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Error editing user');
        return await response.json();
    }

    getDataForEditModal(event) {
        const button = event.currentTarget;
        const row = button.closest('tr');
        document.getElementById('userIdEdit').value = row.cells[0].textContent;
        document.getElementById('userNameEdit').value = row.cells[1].textContent;
        document.getElementById('userLastNameEdit').value = row.cells[2].textContent;
        document.getElementById('userEmailEdit').value = row.cells[3].textContent;
    }

    async addUser(event) {
        event.preventDefault();
        const addUser = this.getDataForAddModal();
        try {
            await this.postAddUser(addUser);
            this.addFormTarget.reset();
            this.hideModal('userModalAdd');
            await this.fillTable();
        } catch (error) {
            this.handleError(error);
        }
    }

    async postAddUser(user) {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ user: user }),
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Error adding user');
        return await response.json();
    }

    getDataForAddModal() {
        const form = this.addFormTarget;
        return {
            first_name: form.querySelector('#userNameAdd').value,
            last_name: form.querySelector('#userLastNameAdd').value,
            email: form.querySelector('#userEmailAdd').value,
            password: form.querySelector('#userPasswordAdd').value,
            role_ids: [form.querySelector('#userRoleAdd').value]
        };
    }

    async getUsers() {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Error fetching users');
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