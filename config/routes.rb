Rifff::Application.routes.draw do
 
  resources :projects do 
     resources :sound_files
  end 
     
  devise_for :users
  root :to => "welcome#index"
  
  
  match 'projects/:id/save_json' => 'projects#save_json'
end
