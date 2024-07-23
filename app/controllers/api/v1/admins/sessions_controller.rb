module Api
  module V1
    module Admins
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          render json: {
            status: { code: 200, message: 'Logged in sucessfully.' },
            admin: ::V1::AdminBlueprint.render_as_hash(resource)
          }, status: :ok
        end

        def respond_to_on_destroy
          if current_admin
            render json: { status: { code: 200, message: "Logged out successfully" } }, status: :ok
          else
            render json: { status: { code: 401, message: "Couldn't find an active session." } }, status: :unauthorized
          end
        end
      end
    end
  end
end