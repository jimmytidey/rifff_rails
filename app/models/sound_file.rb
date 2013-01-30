class SoundFile < ActiveRecord::Base
  attr_accessible :name, :project_id, :sound
  belongs_to :project
  mount_uploader :sound, SoundUploader
end
