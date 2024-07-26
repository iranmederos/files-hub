class Api::V1::UsersController < Api::V1::BaseController
  before_action :authenticate_user!, only: [:create]
  before_action :authorize_user!, except: [:create, :index, :show]

  expose :user

  has_scope :by_email, as: :email

  def index
    render_scoped_list(User, V1::UserBlueprint)
  end

  def show
    if user
      render_success V1::UserBlueprint.render(user)
    else
      render_error "Not Found"
    end
  end


  def create
    if user.create(user_params)
      render_success V1::UserBlueprint.render(user)
    else
      render_error V1::UserBlueprint.render(user)
    end
  end

  def update
    if user.update(user_params)
      render_success V1::UserBlueprint.render(user)
    else
      render_error V1::UserBlueprint.render(user)
    end
  end

  def destroy
    if user.destroy
      render_success "Resource Deleted Successfully"
    else
      render_error V1::UserBlueprint.render(user)
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :first_name, :last_name, :password, :password_confirmation)
  end

  def authorize_user!
    return if current_user.has_role?(:admin)
    render_error "Unauthorized"
  end
end
