require 'json'
require 'redcarpet'

class SocketController < WebsocketRails::BaseController
  include ActionView::Helpers::SanitizeHelper

  def initialize_session
    controller_store[:board_slug] = nil
    controller_store[:player_color] = nil
  end

  def client_connected
    puts "Client Connected #{client_id}"
  end

  def client_disconnected
    @board = Board.find_by_slug(controller_store[:board_slug])

    if client_id == @board.white_player
      @msg = Chatmsg.new
      @msg.chatlog_id = @board.chatlog.id
      @msg.player = 'server'
      @msg.text = 'white player has disconnected.'
      @msg.save

      @board.white_player = nil
      @board.has_white_player = false
    elsif client_id == @board.black_player
      @msg = Chatmsg.new
      @msg.chatlog_id = @board.chatlog.id
      @msg.player = 'server'
      @msg.text = 'black player has disconnected.'
      @msg.save

      @board.black_player = nil
      @board.has_black_player = false
    end

    @board.save

    # send_message :try_to_reconnect, {}

    broadcast_message :new_chat_message, { :slug => controller_store[:board_slug], :log => @board.chatlog.to_json(:include => :included_msgs) }

    broadcast_message :player_disconnected, { :slug => controller_store[:board_slug], :player => controller_store[:player_color] }
  end

  def set_board
    controller_store[:board_slug] = message[:slug]
    @board = Board.find_by_slug(controller_store[:board_slug])
    has_partner = false

    if !@board.has_white_player && !@board.white_player
      controller_store[:player_color] = 'white'
      @board.white_player = client_id
      @board.has_white_player = true

      if @board.has_black_player && @board.black_player
        has_partner = true
      end

      @msg = Chatmsg.new
      @msg.chatlog_id = @board.chatlog.id
      @msg.player = 'server'
      @msg.text = 'white player has connected.'
      @msg.save

    elsif !@board.has_black_player && !@board.black_player
      controller_store[:player_color] = 'black'
      @board.black_player = client_id
      @board.has_black_player = true

      if @board.has_white_player && @board.white_player
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

    broadcast_message :player_connected, { :slug => controller_store[:board_slug], :player => controller_store[:player_color] }

    send_message :update_board, { :slug => controller_store[:board_slug], :board => @board.board.to_json, :player => controller_store[:player_color], :has_partner => has_partner }
  end

  def update_board
    @board = Board.find_by_slug(controller_store[:board_slug])
    @board.board = message[:board]
    @board.save

    has_partner = false

    if client_id == @board.white_player
      if @board.has_black_player && @board.black_player
        has_partner = true
      end
    elsif client_id == @board.black_player
      if @board.has_white_player && @board.white_player
        has_partner = true
      end
    end

    broadcast_message :update_board, { :slug => controller_store[:board_slug], :board => @board.board.to_json, :has_partner => has_partner }
  end

  def new_chat_message
    @board = Board.find_by_slug(controller_store[:board_slug])
    redcarpet = Redcarpet::Markdown.new(Redcarpet::Render::HTML.new, {fenced_code_blocks: true})

    @msg = Chatmsg.new
    @msg.chatlog_id = @board.chatlog.id
    @msg.player = message[:player]
    @msg.text = redcarpet.render(strip_tags(message[:text]))
    @msg.save

    broadcast_message :new_chat_message, { :slug => controller_store[:board_slug], :log => @board.chatlog.to_json(:include => :included_msgs) }
  end

  def switch_player
    @board = Board.find_by_slug(controller_store[:board_slug])

    if client_id == @board.white_player
      if !@board.has_black_player && !@board.black_player
        @board.black_player = client_id
        @board.has_white_player = false
        @board.has_black_player = true
        @board.white_player = nil

        controller_store[:player] = 'black'

        @msg = Chatmsg.new
        @msg.chatlog_id = @board.chatlog.id
        @msg.player = 'server'
        @msg.text = 'white player switched to black player.'
        @msg.save
      end
    elsif client_id == @board.black_player
      if !@board.has_white_player && !@board.white_player
        @board.white_player = client_id
        @board.has_black_player = false
        @board.has_white_player = true
        @board.black_player = nil

        controller_store[:player] = 'white'

        @msg = Chatmsg.new
        @msg.chatlog_id = @board.chatlog.id
        @msg.player = 'server'
        @msg.text = 'black player switched to white player.'
        @msg.save
      end
    end

    @board.save

    broadcast_message :new_chat_message, { :slug => controller_store[:board_slug], :log => @board.chatlog.to_json(:include => :included_msgs) }

    send_message :switch_player, { :player => controller_store[:player], :board => @board.board.to_json }
  end

  def toggle_fairies
    @board = Board.find_by_slug(controller_store[:board_slug])

    @msg = Chatmsg.new
    @msg.chatlog_id = @board.chatlog.id
    @msg.player = 'server'
    @msg.text = message[:player] + ' turned ' + (message[:fairies] ? 'on' : 'off') + ' playing with fairies.'
    @msg.save

    broadcast_message :toggle_fairies,   { :slug => controller_store[:board_slug], fairies: message[:fairies]}
    broadcast_message :new_chat_message, { :slug => controller_store[:board_slug], :log => @board.chatlog.to_json(:include => :included_msgs) }
  end
end