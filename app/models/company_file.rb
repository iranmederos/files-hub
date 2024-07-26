# frozen_string_literal: true

class CompanyFile < ApplicationRecord
  belongs_to :company

  validates :file, presence: true
  validates :name, presence: true

  before_validation :normalize_name

  private

  def normalize_name
    name&.to_s&.downcase
  end
end
