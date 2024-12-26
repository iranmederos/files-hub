import { Application } from "@hotwired/stimulus"
import DashboardController from "./dashboard_controller"
import LoginController from "./login_controller";
const application = Application.start()
application.register("dashboard", DashboardController)
application.register("login", LoginController)
// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

document.addEventListener('turbo:load', () => {
    // Reinitialize Stimulus controllers
    application.start()
})

export { application }
