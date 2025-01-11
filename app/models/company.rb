# frozen_string_literal: true

class Company < ApplicationRecord
  belongs_to :user
  has_many :company_file, dependent: :destroy

  validates :name, presence: true, uniqueness: true

  before_validation :normalize_name

  private

  def normalize_name
    name&.to_s&.downcase
  end
end
