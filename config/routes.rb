Chs::Application.routes.draw do
  get '/:slug' => 'boards#show'
  root 'boards#index'
end
