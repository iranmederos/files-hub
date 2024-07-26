module Api
  module V1
    class AuthenticationController < ApplicationController
      skip_before_action :verify_authenticity_token

      def login
        user_params = params.require(:user).permit(:email, :password)
        user = User.find_by(email: user_params[:email])

        if user&.authenticate(user_params[:password])
          token = JWT.encode({ id: user.id }, Rails.application.secrets.secret_key_base)
          render json: { token: token }, status: :ok
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
