Rails.application.routes.draw do
  # mount Sidekiq::Web => "/sidekiq", as: 'sidekiq_web'
  namespace :api do
    namespace :v1 do
      post 'login', to: 'authentication#login'
      get 'auto_login', to: 'authentication#auto_login'

      resources :users

      resources :roles, only: %i[index]

    end
  end

  root to: proc { [200, {}, ['Welcome to IRANPLAZ API']] }
end
