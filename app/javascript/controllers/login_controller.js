import { Controller } from "@hotwired/stimulus"

export default class LoginController extends Controller {
    static targets = ["email", "password", "errorMessage"]

    connect() {
        this.element.addEventListener("submit", this.login.bind(this))
    }

    async login(event) {
        event.preventDefault()
        const email = this.emailTarget.value
        const password = this.passwordTarget.value

        try {
            const response = await fetch("/api/v1/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ user: { email, password } })
            })

            if (response.ok) {
                const data = await response.json()
                console.log("Login successful:", data)
                localStorage.setItem('token', data.token);
                localStorage.setItem('id', data.id);
                window.location.href = "/dashboard";
            } else {
                this.showError("Invalid credentials")
            }
        } catch (error) {
            this.showError("An error occurred. Please try again.")
        }
    }

    showError(message) {
        this.errorMessageTarget.textContent = message
        this.errorMessageTarget.hidden = false
    }
}