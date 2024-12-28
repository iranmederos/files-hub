import { Application } from "@hotwired/stimulus"
import DashboardController from "./dashboard_controller"
import LoginController from "./login_controller";
import ManageUsersController from "./manage_users_controller";

const application = Application.start()
application.register("dashboard", DashboardController)
application.register("login", LoginController)
application.register("manage-users", ManageUsersController)

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

document.addEventListener('turbo:load', () => {
    application.start()
})

export { application }
