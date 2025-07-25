class CompanyFile < ApplicationRecord
  belongs_to :company
  belongs_to :institution
  belongs_to :folder_file

  has_one_attached :file

  validates :file, presence: true, on: :create
  validates :name, presence: true, uniqueness: { scope: [:company_id, :institution_id], message: "File name must be unique within the company and institution" }

  before_validation :normalize_name

  scope :by_company_and_institution, ->(company_id, institution_id, folder_file_id) {
    where(company_id: company_id, institution_id: institution_id, folder_file_id: folder_file_id) }

  scope :by_folder_file, ->(folder_file_id) {
    where(folder_file_id: folder_file_id) }

  private

  def normalize_name
    name&.to_s&.downcase!
  end
end
