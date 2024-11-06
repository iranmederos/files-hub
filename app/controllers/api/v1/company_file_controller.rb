class Api::V1::CompanyFileController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :authorize_user!

  expose :company_file, find: ->(id, scope) { scope.find_by(id: id) }
  expose :company_files, -> {
    if params[:institution_id].present?
      CompanyFile.by_company_and_institution(params[:company_id], params[:institution_id])
    else
      CompanyFile.where(company_id: params[:company_id])
    end
  }
  expose :new_company_file, -> { CompanyFile.new(company_file_params) }

  def index
    render_scoped_list(CompanyFile, V1::CompanyFileBlueprint)
  end

  def index_by
    if company_files
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
    if new_company_file.save!
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
    params.require(:company_file).permit(:name, :file, :file_type, :company_id, :institution_id)
  end
end
