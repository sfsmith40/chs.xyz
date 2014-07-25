class BoardsController < ApplicationController
  def show
    redirect_to 'http://chs.xyz/' + params[:slug], :status => :moved_permanently
  end

  def index
    redirect_to 'http://chs.xyz/', :status => :moved_permanently
  end
end
