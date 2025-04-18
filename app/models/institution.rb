class Institution < ApplicationRecord
  has_many :company_files
  has_many :folder_files
end
