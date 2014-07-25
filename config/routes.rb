Chess::Application.routes.draw do
  match "/websocket", :to => WebsocketRails::ConnectionManager.new, via: [:get, :post]

  get '/:id' => 'boards#show', :as => 'show_board'

  get '/*path' => 'boards#index'

  root :to => 'boards#index'
end
