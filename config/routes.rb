Rails.application.routes.draw do
  # mount Sidekiq::Web => "/sidekiq", as: 'sidekiq_web'
  namespace :api do
    namespace :v1 do
      post 'login', to: 'authentication#login'
      get 'auto_login', to: 'authentication#auto_login'

      resources :users

      resources :roles, only: %i[index]

      resources :company do
        collection do
          get 'index_by_user', to: 'company#index_by_user'
        end
      end

      resources :company_file do
        collection do
          get 'index_by_company', to: 'company_file#index_by_company'
        end
      end

    end
  end

  root to: proc { [200, {}, ['Welcome to IRANPLAZ API']] }
end
