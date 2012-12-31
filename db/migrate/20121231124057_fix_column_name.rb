class FixColumnName < ActiveRecord::Migration
  def change
    rename_column :sound_files, :parent_id, :project_id
  end
end
