class AddInstitutionToCompanyFile < ActiveRecord::Migration[7.1]
  def change
    add_reference :company_files, :institution, null: false, foreign_key: true
  end
end
