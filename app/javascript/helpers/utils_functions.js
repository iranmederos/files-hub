export function checkLogin() {
    if (!localStorage.getItem('token')) {
        alert('No estás logueado');
        window.location.href = '/';
    }
}

export function getClaims(token) {
    return token ? JSON.parse(atob(token.split('.')[1])) : null;
}