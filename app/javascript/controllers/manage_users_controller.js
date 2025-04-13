import {Controller} from "@hotwired/stimulus"

export default class ManageUsersController extends Controller {
    static targets = ["bodyTable", "addForm", "editForm", "deleteForm"];
    API_URL = "api/v1/users/"
    idDelete = null;


    connect() {
        if (!localStorage.getItem('token') || !localStorage.getItem('id')) {
            alert('No estás logueado');
            window.location.href = '/';
        }

        this.token = localStorage.getItem('token');
        this.id = localStorage.getItem('id');

        this.getUsers().then(data => {
            this.fillTable(data);
        });
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const row = button.parentElement.parentElement;
        this.idDelete = row.cells[0].textContent;
    }

    async deleteUser() {
        const url = `${this.API_URL}${this.idDelete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data) {
            window.location = '/manage_users';
        } else {
            alert('Error al eliminar usuario');
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
        let id = form.querySelector('#userIdEdit').value;
        console.log(id)
        await this.putEditUser(editedUser, id);
    }

    async putEditUser(user, id) {
        const url = `${this.API_URL}${id}`;

        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({user: user}),
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data) {
            window.location = '/manage_users';
        } else {
            alert('Error al editar usuario');
        }
    }

    getDataForEditModal(event) {
        const button = event.currentTarget;
        const row = button.parentElement.parentElement;

        document.getElementById('userIdEdit').value = row.cells[0].textContent;
        document.getElementById('userNameEdit').value = row.cells[1].textContent;
        document.getElementById('userLastNameEdit').value = row.cells[2].textContent;
        document.getElementById('userEmailEdit').value = row.cells[3].textContent;
    }

    async addUser(event) {
        event.preventDefault();

        const addUser = this.getDataForAddModal();
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({user: addUser}),
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data) {
            window.location = '/manage_users';
        } else {
            alert('Error al agregar usuario');
        }
    }

    getDataForAddModal() {
        const form = this.addFormTarget;
        return  {
            first_name: form.querySelector('#userNameAdd').value,
            last_name: form.querySelector('#userLastNameAdd').value,
            email: form.querySelector('#userEmailAdd').value,
            password: form.querySelector('#userPasswordAdd').value,
            role_ids: [form.querySelector('#userRoleAdd').value]
        };
    }

    fillTable(users) {
        this.bodyTableTarget.innerHTML = '';
        users.forEach(user => {
            let fechaAlta = new Date(user.created_at);
            let formattedDate = ('0' + fechaAlta.getDate()).slice(-2) + '-' + ('0' + (fechaAlta.getMonth() + 1)).slice(-2) + '-' + fechaAlta.getFullYear();

            this.bodyTableTarget.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.first_name}</td>
                <td>${user.last_name}</td>
                <td>${user.email}</td>
                <td>${formattedDate}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                        data-bs-target="#userModalEdit" data-action="click->manage-users#getDataForEditModal">Editar</button>
                    <button class="btn btn-danger btn-sm" data-bs-toggle="modal" data-action="click->manage-users#getIdFromTable"
                        data-bs-target="#userModalDelete">Eliminar</button>
                </td>
            </tr>
        `;
        });
    }

    async getUsers() {
        const url = this.API_URL;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }
}