require 'json'

class SocketController < WebsocketRails::BaseController
  include ActionView::Helpers::SanitizeHelper

  def initialize_session
    controller_store[:board_slug] = nil
    controller_store[:player] = nil
  end

  def client_connected
    puts "Client Connected #{client_id}"
  end

  def client_disconnected
    @board = Board.find_by_slug(controller_store[:board_slug])

    @msg = Chatmsg.new
    @msg.chatlog_id = @board.chatlog.id
    @msg.player = 'server'

    if controller_store[:player] == 'white'
      @msg.text = 'white player has disconnected.'
      @board.has_white_player = false
    elsif controller_store[:player] == 'black'
      @msg.text = 'black player has disconnected.'
      @board.has_black_player = false
    end

    @board.save

    @msg.save

    broadcast_message :new_chat_message, { :slug => controller_store[:board_slug], :log => @board.chatlog.to_json(:include => :included_msgs) }

    broadcast_message :player_disconnected, { :slug => controller_store[:board_slug], :player => controller_store[:player] }
  end

  def set_board
    controller_store[:board_slug] = message[:slug]
    @board = Board.find_by_slug(controller_store[:board_slug])
    has_partner = false

    if !@board.has_white_player
      controller_store[:player] = 'white'
      @board.has_white_player = true
      if @board.has_black_player
        has_partner = true
      end

      @msg = Chatmsg.new
      @msg.chatlog_id = @board.chatlog.id
      @msg.player = 'server'
      @msg.text = 'white player has connected.'
      @msg.save

    elsif !@board.has_black_player
      controller_store[:player] = 'black'
      @board.has_black_player = true
      if @board.has_white_player
        has_partner = true
      end

      @msg = Chatmsg.new
      @msg.chatlog_id = @board.chatlog.id
      @msg.player = 'server'
      @msg.text = 'black player has connected.'
      @msg.save

    else
      send_message :goto_new_game, {}
    end

    @board.save

    broadcast_message :new_chat_message, { :slug => controller_store[:board_slug], :log => @board.chatlog.to_json(:include => :included_msgs) }

    broadcast_message :player_connected, { :slug => controller_store[:board_slug], :player => controller_store[:player] }

    send_message :update_board, { :slug => controller_store[:board_slug], :board => @board.board.to_json, :player => controller_store[:player], :has_partner => has_partner }
  end

  def update_board
    @board = Board.find_by_slug(controller_store[:board_slug])
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

    broadcast_message :update_board, { :slug => controller_store[:board_slug], :board => Board.find_by_slug(controller_store[:board_slug]).board.to_json, :has_partner => has_partner }
  end

  def new_chat_message
    @board = Board.find_by_slug(controller_store[:board_slug])

    @msg = Chatmsg.new
    @msg.chatlog_id = @board.chatlog.id
    @msg.player = message[:player]#.gsub(/<\/?[^>]+>/, '')
    @msg.text = strip_tags(message[:text])
    @msg.save

    # @chatlog = @board.chatlog.includes(:included_msgs)

    broadcast_message :new_chat_message, { :slug => controller_store[:board_slug], :log => @board.chatlog.to_json(:include => :included_msgs) }
  end
end