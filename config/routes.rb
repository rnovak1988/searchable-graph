Rails.application.routes.draw do
  resources :permissions
  resources :documents
  resources :icons, only: [:index]
  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root to: 'application#home'

end
