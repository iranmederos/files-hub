class Api::V1::CompanyFileController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :authorize_user!, except: [:index_by_company]

  expose :company_file

  def index
    render_scoped_list(CompanyFile, V1::CompanyFileBlueprint)
  end

  def index_by_company
    if (company_files = CompanyFile.where(company_id: params[:company_id]))
      render_success V1::CompanyFileBlueprint.render(company_files)
    else
      render_error "Not Found"
    end
  end

  def show
    if company_file
      render_success V1::CompanyFileBlueprint.render(company_file)
    else
      render_error "Not Found"
    end
  end

  def create
    if company_file.create(company_file_params)
      render_success V1::CompanyFileBlueprint.render(company_file)
    else
      render_error V1::CompanyFileBlueprint.render(company_file)
    end
  end

  def update
    if company_file.update(company_file_params)
      render_success V1::CompanyFileBlueprint.render(company_file)
    else
      render_error V1::CompanyFileBlueprint.render(company_file)
    end
  end

  def destroy
    if company_file.destroy
      render_success "Resource Deleted Successfully"
    else
      render_error V1::CompanyFileBlueprint.render(company_file)
    end
  end

  private

  def company_file_params
    params.require(:company_file).permit(:name, :file, :type_file, :company_id)
  end
end
