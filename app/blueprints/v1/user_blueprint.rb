# frozen_string_literal: true

class V1::UserBlueprint < Blueprinter::Base
  identifier :id
  fields :email, :first_name, :last_name

  association :roles, blueprint: V1::RoleBlueprint

  view :full do
    fields :deleted_at, :deleted, :created_at, :updated_at, :reset_password_token, :reset_password_sent_at,
           :remember_created_at, :sign_in_count, :current_sign_in_at , :last_sign_in_at, :current_sign_in_ip,
           :last_sign_in_ip, :confirmation_token, :confirmed_at, :confirmation_sent_at, :unconfirmed_email,
           :failed_attempts, :unlock_token, :locked_at
  end

  field :errors do |resource, _options|
    resource.errors.as_json(full_messages: true)
  end
end
