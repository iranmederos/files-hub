class V1::FolderFileBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :created_at, :updated_at

  association :company_files, blueprint: V1::CompanyFileBlueprint

  field :institution_id do |folder_file|
    folder_file.institution.id
  end

  field :company_id do |folder_file|
    folder_file.company.id
  end
end
