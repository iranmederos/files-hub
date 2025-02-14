class ApplicationController < ActionController::Base
  #before_action :authenticate_user!, except: %i[login auto_login]

  private

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last

    if token.present?
      begin
        decoded_token = JWT.decode(token, Rails.application.secrets.secret_key_base).first
        @current_user = User.find(decoded_token['id'])
      rescue JWT::DecodeError
        render json: { error: 'Invalid token' }, status: :unauthorized
      end
    else
      render json: { error: 'Missing token' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
