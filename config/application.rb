require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Tmp
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.action_mailer.delivery_method = :smtp

    config.action_mailer.smtp_settings = {
        :address => 'smtp.gmail.com',
        :port => 465,
        :user_name => ENV['RAILS_SMTP_USERNAME'],
        :password => ENV['RAILS_SMTP_PASSWORD'],
        :authentication => :plain,
        :ssl => true
    }

  end
end
