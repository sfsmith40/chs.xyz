Chess::Application.routes.draw do
  # resources :boards

  get '/b/:id' => 'boards#show', :as => 'show_board'

  # get '/websocket' => {:controller => 'websocket_rails', :action => ''}
  # match '/websocket' => 'websocket_rails#'

  match "/websocket", :to => WebsocketRails::ConnectionManager.new, via: [:get, :post]

  get '/*path' => 'boards#index'

  root :to => 'boards#index'
end
