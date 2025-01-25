source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.2"

gem 'azure-blob'
gem 'bcrypt', '~> 3.1.7'
gem "bootsnap", require: false
gem 'blueprinter'
gem "decent_exposure"
gem "haml"
gem "has_scope"
gem "importmap-rails"
gem "jbuilder"
gem 'jwt'
gem 'money'
gem 'money-rails'
gem 'mysql2', '~> 0.5'
gem "puma", ">= 5.0"
gem "rails"
gem "rack-cors"
gem "rails_param"
gem "redis", "~> 4.0"
gem "sidekiq", "~> 6.4.2"
gem "sprockets-rails"
gem "stimulus-rails"
gem "sqlite3"
gem "turbo-rails"
gem "tzinfo-data", platforms: %i[ mswin mswin64 mingw x64_mingw jruby ]

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri mswin mswin64 mingw x64_mingw ]
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"

  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  # gem "rack-mini-profiler"

  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  gem "spring"
end

group :test do
  # Use system testing [https://guides.rubyonrails.org/testing.html#system-testing]
  gem "capybara"
  gem "selenium-webdriver"
end
