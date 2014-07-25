class BoardsController < ApplicationController
  def show
    redirect_to 'http://chess.joahg.com/b/' + params[:slug]
  end

  def index
    redirect_to 'http://chess.joahg.com/'
  end
end
