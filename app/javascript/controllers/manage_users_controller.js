import { Controller } from "@hotwired/stimulus"

export default class ManageUsersController extends Controller {
    static targets = ["bodyTable", "addForm", "editForm", "deleteForm"]

    connect() {
        if (!localStorage.getItem('token') || !localStorage.getItem('id')) {
            alert('No estás logueado');
            window.location.href = '/';
        }

        this.token = localStorage.getItem('token');
        this.id = localStorage.getItem('id');

        this.fetchUsuarios().then(data => {
            this.fillTable(data);
        });
    }

    getIdFromTable(event) {
        const button = event.currentTarget;
        const row = button.parentElement.parentElement;
        return row.cells[0].textContent;
    }

    async fetchEliminarUsuario() {
        let id = this.getIdFromTable(event);
        const url = `api/v1/users/${id}`;
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

    async fetchEditarUsuario() {
        event.preventDefault();
        const form = this.editFormTarget;
        const editedUser = {
            first_name: form.querySelector('#userNameEdit').value,
            last_name: form.querySelector('#userLastNameEdit').value,
            email: form.querySelector('#userEmailEdit').value,
            password: form.querySelector('#userPasswordEdit').value
        };
        let id = form.querySelector('#userIdEdit').value;

        const url = `api/v1/users/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({user: editedUser}),
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

    async fetchAgregarUsuario(usuario) {
        const url = `api/v1/users`;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(usuario),
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
                <td>
                    <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                        data-bs-target="#userModalEdit" data-action="click->manage-users#getDataForEditModal">Editar</button>
                    <button class="btn btn-danger btn-sm" data-bs-toggle="modal"
                        data-bs-target="#userModalDelete">Eliminar</button>
                </td>
            </tr>
        `;
        });
    }

    async fetchUsuarios() {
        const url = `api/v1/users`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data;
    }
}