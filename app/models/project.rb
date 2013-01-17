class Project < ActiveRecord::Base
  attr_accessible :name, :parent_id, :sound_files_attributes, :json
  has_many :sound_files 
  accepts_nested_attributes_for :sound_files, :allow_destroy => :true
end
