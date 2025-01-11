# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles
  has_many :companies, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :password, presence: true

  before_validation :normalize_email

  def has_role?(role_name)
    roles.exists?(name: role_name)
  end

  private

  def normalize_email
    email&.to_s&.downcase
  end

  def self.from_token_request(request)
    email = request.params['auth'] && request.params['auth']['email']
    self.find_by(email: email)
  end

  def self.from_token_payload(payload)
    self.find(payload['sub'])
  end

  def generate_jwt
    JWT.encode({ id: id, exp: 60.days.from_now.to_i }, Rails.application.secrets.secret_key_base)
  end
end
