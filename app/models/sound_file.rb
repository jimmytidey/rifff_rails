class SoundFile < ActiveRecord::Base
  attr_accessible :name, :project_id, :sound
  belongs_to :project
  mount_uploader :sound, SoundUploader
  include Rails.application.routes.url_helpers
  
  #one convenient method to pass jq_upload the necessary information
  def to_jq_upload
  {
    "id" => read_attribute(:id),
    "title" => read_attribute(:title),
    "description" => read_attribute(:description),
    "name" => read_attribute(:file),
    "size" => file.size,
    "url" => file.url,
    "thumbnail_url" => file.thumb.url,
    "delete_url" => picture_path(:id => id),
    "delete_type" => "DELETE" 
   }
  end
  
end
