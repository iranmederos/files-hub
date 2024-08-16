class Api::V1::UsersController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :authorize_user!, except: [:show]

  expose :user, find: ->(id, scope) { scope.find_by(id: id) }
  expose :new_user, -> { User.new(user_params) }

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
    if new_user.save
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
end
