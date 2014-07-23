class BoardsController < ApplicationController
  def index
    @board = Board.new
    @board.save
    redirect_to '/b/' + @board.slug
  end

  def show
    @board = Board.find_by_slug(params[:id])
    @board.save
  end
end
