class V1::CompanyFileBlueprint < Blueprinter::Base
  include Rails.application.routes.url_helpers

  identifier :id

  fields :name, :file_type, :created_at

  field :updated_at do |company_file|
    company_file&.updated_at.in_time_zone('America/Caracas').strftime('%d/%m/%Y - %H:%M:%S')
  end

  field :company_id do |company_file|
    company_file.company_id
  end

  field :institution_id do |company_file|
    company_file.institution_id
  end

  field :folder_id do |company_file|
    company_file.folder_file_id
  end

  field :errors do |resource, _options|
    resource.errors.as_json(full_messages: true)
  end
end
