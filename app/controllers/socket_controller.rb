require 'json'

class SocketController < WebsocketRails::BaseController
  def initialize_session
    # puts "Session Initialized"
    controller_store[:board] = nil
  end

  def client_connected
    # puts "Client Connected #{client_id}"
  end

  def client_disconnected
    @board = Board.find_by_slug(controller_store[:board])
    # if @board.players == 2
    #   @board.players = 1
    # elsif @board.players == 1
    #   @board.players = 0
    # end
    @board.save
  end

  def set_board
    controller_store[:board] = message[:slug]
    @board = Board.find_by_slug(controller_store[:board])
    if @board.players == 2
      send_message :goto_new_game, {}
    elsif @board.players == 1
      @board.players = 2
    elsif @board.players == 0 || @board.players == nil
      @board.players = 1
    end
    @board.save

    send_message :update_board, {:slug => controller_store[:board], :board => @board.board.to_json, :player => @board.players}
  end

  def update_board
    @board = Board.find_by_slug(controller_store[:board])
    @board.board = message[:board]
    @board.save

    broadcast_message :update_board, {:slug => controller_store[:board], :board => Board.find_by_slug(controller_store[:board]).board.to_json}
  end
end