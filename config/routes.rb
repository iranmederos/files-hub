Rails.application.routes.draw do
  #mount Sidekiq::Web => "/sidekiq", as: 'sidekiq_web'




  root to: proc { [200, {}, ['Welcome to IRANPLAZ API']] }
end
