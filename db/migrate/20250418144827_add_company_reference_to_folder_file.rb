class AddCompanyReferenceToFolderFile < ActiveRecord::Migration[7.1]
  def change
    add_reference :folder_files, :company, foreign_key: true
  end
end
