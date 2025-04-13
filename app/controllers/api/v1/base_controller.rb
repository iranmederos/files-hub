class Api::V1::BaseController < Api::BaseController
  def authorize_user!
    return if current_user.has_role?(:admin)
    if current_user.has_role?(:client)
      allowed_actions = %w[index index_by show download show_file get]
      return if allowed_actions.include?(action_name)
    end
    render_error "Unauthorized"
  end
end