class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.integer :parent_id
      t.string :name

      t.timestamps
    end
  end
end
