class BoardsController < ApplicationController
  def show
    redirect_to 'http://chess.joahg.com/b/' + params[:slug], :status => :moved_permanently
  end

  def index
    redirect_to 'http://chess.joahg.com/', :status => :moved_permanently
  end
end
