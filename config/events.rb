WebsocketRails::EventMap.describe do
  subscribe :client_connected, to: GameController, with_method: :client_connected
  subscribe :set_board, to: GameController, with_method: :set_board
  subscribe :update_board, to: GameController, with_method: :update_board
  subscribe :client_disconnected, :to => GameController, :with_method => :client_disconnected
  subscribe :new_chat_message, :to => GameController, :with_method => :new_chat_message
  subscribe :switch_player, :to => GameController, :with_method => :switch_player
  subscribe :toggle_fairies, :to => GameController, :with_method => :toggle_fairies
  subscribe :record_log, :to => GameController, :with_method => :record_log

  subscribe :open_lobby, :to => LobbyController, :with_method => :update
  subscribe :set_board, to: LobbyController, with_method: :update
  subscribe :client_disconnected, :to => LobbyController, :with_method => :update
  subscribe :switch_player, :to => LobbyController, :with_method => :update
end