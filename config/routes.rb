Rails.application.routes.draw do
  # mount Sidekiq::Web => "/sidekiq", as: 'sidekiq_web'
  namespace :api do
    namespace :v1 do
      get 'login', to: 'authentication#new'
      post 'login', to: 'authentication#login'
      get 'auto_login', to: 'authentication#auto_login'

      resources :users
      resources :roles, only: %i[index]
      resources :institution

      resources :folder_file do
        collection do
          get 'index_by', to: 'folder_file#index_by'
        end
      end

      resources :company do
        collection do
          get 'index_by_user', to: 'company#index_by_user'
        end
      end

      resources :company_file do
        collection do
          get 'index_by', to: 'company_file#index_by'
          get 'download/:id', to: 'company_file#download'
          get 'show_file/:id', to: 'company_file#show_file'
        end
      end
    end
  end

  root 'login#login'
  get 'dashboard', to: 'dashboard#dashboard'
  get 'manage_users', to: 'dashboard#manage_users'
  get 'manage_files', to: 'dashboard#manage_files'
  get 'manage_folders', to: 'dashboard#manage_folders'
  get 'manage_companies', to: 'dashboard#manage_companies'
  get 'options', to: 'dashboard#options'
end
