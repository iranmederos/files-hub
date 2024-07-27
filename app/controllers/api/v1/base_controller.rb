class Api::V1::BaseController < Api::BaseController
  def authorize_user!
    return if current_user.has_role?(:admin)
    render_error "Unauthorized"
  end
end
