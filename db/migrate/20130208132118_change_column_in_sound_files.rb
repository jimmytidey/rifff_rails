class ChangeColumnInSoundFiles < ActiveRecord::Migration
  def up
    rename_column :sound_files, :sound, :url
  end

  def down
    rename_column :sound_files, :url, :sound
  end
end
