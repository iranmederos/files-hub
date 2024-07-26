class CreateFilesTable < ActiveRecord::Migration[7.1]
  def change
    create_table :company_files do |t|
      t.string :name, null: false
      t.string :file, null: false
      t.string :file_type, null: false
      t.references :company, index: true, foreign_key: true
      t.timestamps
    end
  end
end
