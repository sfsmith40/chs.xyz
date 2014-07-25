Chs::Application.routes.draw do
  get '/b/:slug' => 'boards#show'

  get '/*path' => 'boards#index'

  root 'boards#index'
end
