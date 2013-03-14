Rifff::Application.routes.draw do
  
  resources :in_demands


  devise_for :users
  
  resources :projects do
     resources :sound_files
  end 
  
  root :to => "welcome#index"
  
  match 'projects/:id/save_json' => 'projects#save_json'
  match 'projects/:id/list_files' => 'projects#list_files'
end
