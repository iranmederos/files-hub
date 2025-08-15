admin_email = "admin@example.com"
admin_password = "admin"
client_email = "client@example.com"
client_password = "client"

if !Role.exists?
  Role.create!([
    { name: "admin" },
    { name: "client" }
  ])
  admin_role = Role.find_or_create_by!(name: "admin")
  client_role = Role.find_or_create_by!(name: "client")
end

unless User.exists?(email: "admin@example.com") && User.exists?(email: "client@example.com")
  User.find_or_create_by!(email: admin_email) do |user|
    user.password = admin_password
    user.password_confirmation = admin_password
    user.roles << admin_role
  end

  User.find_or_create_by!(email: client_email) do |user|
    user.password = client_password
    user.password_confirmation = client_password
    user.roles << client_role
  end
end

unless Company.exists?
  Company.find_or_create_by!(
    name: "Company A",
    email: "companyA@email.com",
    phone: "1234567890",
    user_id: User.find_by(email: admin_email).id
  )

  Company.find_or_create_by!(
    name: "Company B",
    email: "companyB@email.com",
    phone: "0987654321",
    user_id: User.find_by(email: client_email).id
  )
end

