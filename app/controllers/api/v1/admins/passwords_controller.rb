module Api
  module V1
    module Admins
      class PasswordsController < Devise::PasswordsController
        include RackSessionsFix
      end
    end
  end
end