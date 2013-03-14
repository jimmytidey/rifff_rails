class CreateInDemands < ActiveRecord::Migration
  def change
    create_table :in_demands do |t|

      t.timestamps
    end
  end
end
