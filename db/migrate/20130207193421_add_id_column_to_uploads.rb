class AddIdColumnToUploads < ActiveRecord::Migration
  def change
    add_column :uploads, :project_id, :integer
  end
end
