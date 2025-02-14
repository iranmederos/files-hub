class RemoveFileFromCompanyFiles < ActiveRecord::Migration[7.1]
  def change
    remove_column :company_files, :file, :string
  end
end
