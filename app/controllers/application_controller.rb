class ApplicationController < ActionController::Base
  protect_from_forgery
  
  def after_sign_in_path_for(resource)
    
    if request.referrer.to_s.include? "sign_up" 
      #copy project record 
      house_project = Project.find(71).dup :include => :sound_files
      house_project.user_id = @user.id
      house_project.save
          
      projects_path
    else 
      
      projects_path
    end  
  end
  

end
