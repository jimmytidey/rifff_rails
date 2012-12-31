class AddJsonToProjects < ActiveRecord::Migration
  def self.up
    add_column :projects, :json, :string
  end
 
  def self.down
    remove_column :projects, :json, :string
  end
end
