class ApplicationController < ActionController::Base
  protect_from_forgery
  
  def after_sign_in_path_for(resource)
    
    if request.referrer.to_s.include? "sign_up" 
      
      #copy proect record 
      house_project = Project.find(11)
      new_house_project = Project.new({:user_id => @user.id, :name => 'first project', :json => house_project.json})
      new_house_project.save
      
      #loop through copy sound files
      
      sound_files = SoundFile.where(:project_id => 11)
    
      sound_files.each do |sound_file|
        
        #make a copy in the DB 
        sound_location = sound_file.sound
        new_sound_file = SoundFile.new({:project_id => Project.last.id,:sound => sound_location})
        new_sound_file.save
        
        #update the where the JSON points 
        modified_sound_location = sound_location.to_s.split('/')
        new_house_project.json = new_house_project.json.gsub(sound_location.to_s, "/uploads/sound_file/sound/#{SoundFile.last.id}/#{modified_sound_location[5]}")
        
        #copy the actual files 
        copy_with_path("#{Rails.root}/public#{sound_location}", "#{Rails.root}/public/uploads/sound_file/sound/#{SoundFile.last.id}/#{modified_sound_location[5]}")
      end
      
      new_house_project.update_attributes(:json => new_house_project.json)
      
      projects_path
    else 
      
      projects_path
    end  
  end
  

  
  def copy_with_path(src, dst)
    FileUtils.mkdir_p(File.dirname(dst))
    FileUtils.cp(src, dst)
  end
end
