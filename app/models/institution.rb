# frozen_string_literal: true

class Institution < ApplicationRecord
  has_many :company_files
end
