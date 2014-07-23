Chess::Application.routes.draw do
  # resources :boards

  get '/b/:id' => 'boards#show', :as => 'show_board'

  root :to => 'boards#index'
end
