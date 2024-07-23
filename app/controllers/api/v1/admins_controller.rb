class Api::V1::AdminsController < Api::V1::BaseController
  before_action :authenticate_admin!

  expose :admin

  has_scope :by_name, as: :name
  has_scope :by_email, as: :email

  def index
    render_scoped_list(Admin, V1::AdminBlueprint)
  end

  def create
    if admin.create(admin_params)
      render_success V1::AdminBlueprint.render(admin)
    else
      render_error V1::AdminBlueprint.render(admin)
    end
  end

  def update
    if admin.update(admin_params)
      render_success V1::AdminBlueprint.render(admin)
    else
      render_error V1::AdminBlueprint.render(admin)
    end
  end

  def destroy
    if admin.update(admin_params)
      render_success "Resource Deleted Successfully"
    else
      render_error V1::AdminBlueprint.render(admin)
    end
  end

  def show
    if admin
      render_success V1::AdminBlueprint.render(admin)
    else
      render_error "Not Found"
    end
  end

  private

  def default_list_sort_field
    :id
  end

  def default_list_sort_direction
    :asc
  end

  def admin_params
    params.require(:admin).permit(:email, :first_name, :last_name, admin_role_ids: [] )
  end
end
