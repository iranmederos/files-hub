class CreateInstitutionTable < ActiveRecord::Migration[7.1]
  def change
    create_table :institutions do |t|
      t.string :name
      t.timestamps
    end
  end
end
