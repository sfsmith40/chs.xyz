Chess::Application.routes.draw do

  get '/b/:id' => 'boards#show', :as => 'show_board'

  match "/websocket", :to => WebsocketRails::ConnectionManager.new, via: [:get, :post]

  get '/*path' => 'boards#index'

  root :to => 'boards#index'
end
