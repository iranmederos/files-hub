class Api::V1::AdminRolesController < Api::V1::BaseController
  before_action :authenticate_admin!

  expose :admin_role

  has_scope :by_name, as: :name

  def index
    render_scoped_list(AdminRole, V1::AdminRoleBlueprint)
  end
end
