class IconsController < ApplicationController

  def index
    respond_to do |format|
      format.json {
        render :json => FontAwesomeIcon.all
      }
    end
  end
end
