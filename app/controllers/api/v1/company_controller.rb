class Api::V1::CompanyController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :authorize_user!, except: [:index_by_user]

  expose :company, find: ->(id, scope) { scope.find_by(id: id) }
  expose :companies, -> { Company.where(user_id: params[:user_id]) }
  expose :new_company, -> { Company.new(company_params) }

  def index
    render_scoped_list(Company, V1::CompanyBlueprint)
  end

  def index_by_user
    user = User.find_by(id: params[:user_id])
    if user&.roles&.first&.name == "admin"
      render_success V1::CompanyBlueprint.render(Company.all)
    elsif companies.present?
        render_success V1::CompanyBlueprint.render(companies)
      else
        render_error "Not Found"
      end
    end

  def show
    if company
      render_success V1::CompanyBlueprint.render(company)
    else
      render_error "Not Found"
    end
  end

  def create
    if new_company.save
      render_success V1::CompanyBlueprint.render(company)
    else
      render_error V1::CompanyBlueprint.render(company)
    end
  end

  def update
    if company.update(company_params)
      render_success V1::CompanyBlueprint.render(company)
    else
      render_error company.errors.full_messages.to_sentence
    end
  end

  def destroy
    if company.destroy
      render_success "Resource Deleted Successfully"
    else
      render_error V1::CompanyBlueprint.render(company)
    end
  end

  private

  def company_params
    params.require(:company).permit(:name, :email, :phone, :user_id)
  end
  end
