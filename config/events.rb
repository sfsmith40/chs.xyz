WebsocketRails::EventMap.describe do
  subscribe :client_connected, to: SocketController, with_method: :client_connected
  subscribe :set_board, to: SocketController, with_method: :set_board
  subscribe :update_board, to: SocketController, with_method: :update_board
  subscribe :client_disconnected, :to => SocketController, :with_method => :client_disconnected
  subscribe :new_chat_message, :to => SocketController, :with_method => :new_chat_message
  subscribe :switch_player, :to => SocketController, :with_method => :switch_player
  subscribe :toggle_fairies, :to => SocketController, :with_method => :toggle_fairies
  subscribe :record_log, :to => SocketController, :with_method => :record_log
end