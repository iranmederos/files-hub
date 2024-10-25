class RenameFilesToCompanyFiles < ActiveRecord::Migration[6.0]
  def change
    if table_exists?(:files)
      rename_table :files, :company_files
    else
      puts "Table 'files' does not exist, skipping rename."
    end
  end
end