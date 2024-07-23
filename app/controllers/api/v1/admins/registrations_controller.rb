module Api
  module V1
    module Admins
      class RegistrationsController < ::Devise::RegistrationsController
        before_action :require_admin!

        respond_to :json

        private
        def respond_with(resource, _opts = {})
          if request.method == "POST" && resource.persisted?
            render json: {
              status: { code: 200, message: "Signed up sucessfully." },
              admin: ::V1::AdminBlueprint.render_as_hash(resource)
            }, status: :ok, content_type: "application/json"
          elsif request.method == "DELETE"
            render json: {
              status: { code: 200, message: "Account deleted successfully." }
            }, status: :ok, content_type: "application/json"
          else
            render json: {
              status: { code: 422, message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}" },
              admin: ::V1::AdminBlueprint.render_as_hash(resource)
            }, status: :unprocessable_entity, content_type: "application/json"
          end
        end
      end
    end
  end
end