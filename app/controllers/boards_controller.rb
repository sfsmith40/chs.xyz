class BoardsController < ApplicationController
  def index
    @boards = Board.all.select { |b| b.has_player_waiting != false }
  end

  def show
    @board = Board.find_by_slug(params[:id])
    if !@board
      redirect_to root_url
    end
  end

  def new
    @board = Board.new
    @board.save
    @chatlog = Chatlog.new
    @chatlog.board_id = @board.id
    @chatlog.board_slug = @board.slug
    @chatlog.save
    redirect_to '/' + @board.slug
  end
end
