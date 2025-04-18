# frozen_string_literal: true

class Api::V1::InstitutionController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :authorize_user!

  expose :institution

  def index
    render_scoped_list(Institution, V1::InstitutionBlueprint)
  end

  def show
    if institution
      render_success V1::InstitutionBlueprint.render(institution)
    else
      render_error "Institution not found"
    end
  end

  def create
    if institution.save
      render_success V1::InstitutionBlueprint.render(institution)
    else
      render_error institution.errors.full_messages.to_sentence
    end
  end

  def update
    if institution.update(institution_params)
      render_success V1::InstitutionBlueprint.render(institution)
    else
      render_error institution.errors.full_messages.to_sentence
    end
  end

  def destroy
    if institution.destroy
      render_success "Resource Deleted Successfully"
    else
      render_error institution.errors.full_messages.to_sentence
    end
  end

  private

  def institution_params
    params.require(:institution).permit(:name)
  end
end
