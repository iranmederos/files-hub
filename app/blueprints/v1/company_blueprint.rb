class V1::CompanyBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :email, :phone, :user_id, :created_at, :updated_at

  field :username do |company|
    company.user&.first_name
  end

  view :extended do
    association :company_files, blueprint: V1::CompanyFileBlueprint
  end
end
