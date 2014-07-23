WebsocketRails::EventMap.describe do
  subscribe :client_connected, to: SocketController, with_method: :client_connected
  subscribe :set_board, to: SocketController, with_method: :set_board
  subscribe :update_board, to: SocketController, with_method: :update_board
  subscribe :client_disconnected, :to => SocketController, :with_method => :client_disconnected
end