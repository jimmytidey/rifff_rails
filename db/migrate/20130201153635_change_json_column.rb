class ChangeJsonColumn < ActiveRecord::Migration
  def up
      change_column(:projects, :json, :text)
  end

  def down
      change_column(:projects, :json, :string)
  end
end
