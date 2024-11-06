# frozen_string_literal: true

class V1::CompanyFileBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :file, :file_type, :created_at

  field :updated_at do |company_file|
    company_file&.updated_at.in_time_zone('America/Caracas').strftime('%d/%m/%Y - %H:%M:%S')
  end

  field :company_id do |company_file|
    company_file.company_id
  end

  field :institution_id do |company_file|
    company_file.institution_id
  end
end
