class ApplicationController < ActionController::Base
  protect_from_forgery
  
  def after_sign_up_path_for(resource)
    house_project = Project.find(11)
    new_house_project = Project.new({:user_id => @user.id, :name => 'first project', :json => house_project.json})
    new_house_project.save
    
    sound_files = SoundFile.where(:project_id => 11)
    
    sound_files.each do |sound_file|
      #make new DB records for sounds 
      sound_location = sound_file.sound
      new_sound_file = SoundFile.new({:project_id => Project.last.id,:sound => sound_location})
      new_sound_file.save
      src = "#{sound_location}";
      logger.info "-------------->#{src}"
      copy_with_path("#{Rails.root}/public/#{src}", "#{Rails.root}/public/uploads/sound_file/sound/#{sound_file.id}/#{SoundFile.last.id}")
    end
    
    projects_path
  end
  
  def after_sign_in_path_for(resource)
    projects_path
  end  
  
  
  def copy_with_path(src, dst)
    FileUtils.mkdir_p(File.dirname(dst))
    FileUtils.cp(src, dst)
  end
end
