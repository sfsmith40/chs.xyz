require 'json'
class LobbyController < WebsocketRails::BaseController
  def update
    @boards = Board.all.select { |b| b.has_player_waiting != false }
    broadcast_message :get_boards, { :boards => @boards.to_json }
  end
end