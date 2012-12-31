class AddSoundToSoundFiles < ActiveRecord::Migration
  def change
    add_column :sound_files, :sound, :string
  end
end
