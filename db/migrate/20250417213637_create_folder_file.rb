class CreateFolderFile < ActiveRecord::Migration[7.1]
  def change
    create_table :folder_files do |t|
      t.string :name
      t.integer :size
      t.references :institution, null: false, foreign_key: true
      t.timestamps
    end

    add_index :folder_files, :name
    add_index :folder_files, :size

    add_reference :company_files, :folder_file, foreign_key: true
  end
end
