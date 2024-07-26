class RenameFilesToCompanyFiles < ActiveRecord::Migration[7.1]
  def change
    rename_table :files, :company_files
  end
end
