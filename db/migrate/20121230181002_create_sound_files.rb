class CreateSoundFiles < ActiveRecord::Migration
  def change
    create_table :sound_files do |t|
      t.string :name
      t.integer :parent_id

      t.timestamps
    end
  end
end
