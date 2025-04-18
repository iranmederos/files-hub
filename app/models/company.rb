class Company < ApplicationRecord
  belongs_to :user
  has_many :company_files, dependent: :destroy
  has_many :folder_files, dependent: :destroy

  validates :name, presence: true, uniqueness: true

  before_validation :normalize_name

  private

  def normalize_name
    name&.to_s&.downcase
  end
end
