# frozen_string_literal: true

class V1::CompanyFileBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :file, :created_at, :updated_at

  association :company, blueprint: V1::CompanyBlueprint
end
