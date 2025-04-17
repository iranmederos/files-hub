class FolderFile < ApplicationRecord
  belongs_to :company_file, foreign_key: :company_file_id, null: false

  def normalize_name
    name&.to_s&.downcase!
  end
end
