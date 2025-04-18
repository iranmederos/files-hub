class FolderFile < ApplicationRecord
  belongs_to :institution, foreign_key: :institution_id
  belongs_to :company, foreign_key: :company_id

  has_many :company_files, dependent: :destroy

  scope :by_company_and_institution, ->(company_id, institution_id) { where(company_id: company_id, institution_id: institution_id) }

  def normalize_name
    name&.to_s&.downcase!
  end
end
