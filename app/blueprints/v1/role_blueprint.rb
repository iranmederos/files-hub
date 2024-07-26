# frozen_string_literal: true

class V1::RoleBlueprint < Blueprinter::Base
  identifier :id
  fields :name

  view :full do
    fields :deleted_at, :deleted, :created_at, :updated_at
  end

  field :errors do |resource, _options|
    resource.errors.as_json(full_messages: true)
  end
end
