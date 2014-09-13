Rifff::Application.routes.draw do
  
  devise_for :users
  
  resources :projects do
     resources :sound_files
  end 
  
  root :to => "welcome#index"
  
  match 'projects/:id/iframe' => 'projects#iframe'
  match 'projects/:id/show' => 'projects#show'
  match 'projects/:id/save_json' => 'projects#save_json'
  match 'projects/:id/list_files' => 'projects#list_files'
end
