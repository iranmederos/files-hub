# frozen_string_literal: true
class CompanyFile < ApplicationRecord
  belongs_to :company
  belongs_to :institution

  validates :file, presence: true
  validates :name, presence: true

  before_validation :normalize_name

  scope :by_company_and_institution, ->(company_id, institution_id) { where(company_id: company_id, institution_id: institution_id) }

  private
  def normalize_name
    name&.to_s&.downcase
  end
end
