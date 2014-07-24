require 'json'

class SocketController < WebsocketRails::BaseController
  def initialize_session
    controller_store[:board] = nil
    controller_store[:player] = nil
  end

  def client_connected
    puts "Client Connected #{client_id}"
  end

  def client_disconnected
    @board = Board.find_by_slug(controller_store[:board])

    if controller_store[:player] == 'white'
      @board.has_white_player = false
    elsif controller_store[:player] == 'black'
      @board.has_black_player = false
    end

    broadcast_message :player_disconnected, { :slug => controller_store[:board], :player => controller_store[:player] }

    @board.save
  end

  def set_board
    controller_store[:board] = message[:slug]
    @board = Board.find_by_slug(controller_store[:board])
    has_partner = false

    if !@board.has_white_player
      controller_store[:player] = 'white'
      @board.has_white_player = true
      if @board.has_black_player
        has_partner = true
      end
    elsif !@board.has_black_player
      controller_store[:player] = 'black'
      @board.has_black_player = true
      if @board.has_white_player
        has_partner = true
      end
    else
      send_message :goto_new_game, {}
    end

    broadcast_message :player_connected, { :slug => controller_store[:board], :player => controller_store[:player] }

    @board.save

    send_message :update_board, { :slug => controller_store[:board], :board => @board.board.to_json, :player => controller_store[:player], :has_partner => has_partner }
  end

  def update_board
    @board = Board.find_by_slug(controller_store[:board])
    @board.board = message[:board]
    @board.save

    has_partner = false

    if controller_store[:player] == 'white'
      if @board.has_black_player
        has_partner = true
      end
    elsif controller_store[:player] == 'black'
      if @board.has_white_player
        has_partner = true
      end
    end

    broadcast_message :update_board, { :slug => controller_store[:board], :board => Board.find_by_slug(controller_store[:board]).board.to_json, :has_partner => has_partner }
  end
end