class FixProjectParentColumn < ActiveRecord::Migration
  def change
    rename_column :projects, :parent_id, :user_id
  end
end
