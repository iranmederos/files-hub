# db/seeds.rb

# Ensure the existence of the admin and client roles
if !Role.exists?
  Role.create!([
                 { name: "admin" },
                 { name: "client" }
               ])
  admin_role = Role.find_or_create_by!(name: "admin")
  client_role = Role.find_or_create_by!(name: "client")
end

# Ensure the existence of the admin user
unless User.exists?(email: "admin@example.com") && User.exists?(email: "client@example.com")
  admin_email = "admin@example.com"
  admin_password = "admin"

  User.find_or_create_by!(email: admin_email) do |user|
    user.password = admin_password
    user.password_confirmation = admin_password
    user.roles << admin_role
  end

  client_email = "client@example.com"
  client_password = "client"

  User.find_or_create_by!(email: client_email) do |user|
    user.password = client_password
    user.password_confirmation = client_password
    user.roles << client_role
  end
end

