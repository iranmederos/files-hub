module Api
  module V1
    class AuthenticationController < ApplicationController
      skip_before_action :verify_authenticity_token

      def login
        user_params = params.require(:user).permit(:email, :password)
        user = User.find_by(email: user_params[:email])

        if user&.authenticate(user_params[:password])
          data = {
            id: user.id,
            name: user.first_name,
            roles: user.roles.first&.name,
          }
          token = JWT.encode(data.merge({ exp: 1.hours.from_now.to_i }), ENV["JWT_SECRET_KEY"])
          render json: { token: token, success: true }, status: :ok
        else
          render json: { error: 'Invalid credentials' }, status: :unauthorized
        end
      end

      def auto_login
        token = request.headers['Authorization'].split(' ').last
        decoded_token = JWT.decode(token, Rails.application.secrets.secret_key_base).first
        user = User.find(decoded_token['id'])

        if user
          render json: user, status: :ok
        else
          render json: { error: 'Invalid token' }, status: :unauthorized
        end
      end
    end
  end
end
