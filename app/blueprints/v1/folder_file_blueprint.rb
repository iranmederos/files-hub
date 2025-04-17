class V1::FolderFileBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :created_at, :updated_at

  association :company_files, blueprint: V1::CompanyFilesBlueprint
end
