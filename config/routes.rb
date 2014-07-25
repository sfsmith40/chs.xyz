Chs::Application.routes.draw do
  get '/:slug' => 'boards#show'

  get '/*path' => 'boards#index'

  root 'boards#index'
end
