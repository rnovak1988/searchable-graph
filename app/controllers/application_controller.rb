class ApplicationController < ActionController::Base
  before_action :set_csrf_cookie

  before_action :authenticate_user!

  protect_from_forgery with: :exception

  protected
  def set_csrf_cookie
    if protect_against_forgery?
      cookies['XSRF-TOKEN'] = form_authenticity_token
    end
  end

  def verified_request?
    super || valid_authenticity_token?(session, request.headers['X-XSRF-TOKEN'])
  end
end
