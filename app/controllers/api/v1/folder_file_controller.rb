class Api::V1::FolderFileController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :authorize_user!

  expose :folder_file
  expose :folder_files, -> {finder_with_params(params)}

  def index
    render_scoped_list(FolderFile, V1::FolderFileBlueprint)
  end

  def index_by
    if folder_files
      render_success V1::FolderFileBlueprint.render(folder_files)
    else
      render_error "Not Found"
    end
  end

  def show
    if folder_file
      render_success V1::FolderFileBlueprint.render(folder_file)
    else
      render_error "Not Found"
    end
  end

  def create
    if folder_file.save
      render_success V1::FolderFileBlueprint.render(folder_file)
    else
      render_error V1::FolderFileBlueprint.render(folder_file)
    end
  end

  def update
    if folder_file.update(folder_file_params)
      render_success V1::FolderFileBlueprint.render(folder_file)
    else
      render_error V1::FolderFileBlueprint.render(folder_file)
    end
  end

  def destroy
    if folder_file.destroy
      render_success "Resource Deleted Successfully"
    else
      render_error V1::FolderFileBlueprint.render(folder_file)
    end
  end

  private

  def finder_with_params(params)
    if params[:institution_id].present?
      FolderFile.by_company_and_institution(params[:company_id], params[:institution_id])
    else
      FolderFile.where(company_id: params[:company_id])
    end
  end

  def folder_file_params
    params.require(:folder_file).permit(:name, :company_id, :institution_id)
  end
end
