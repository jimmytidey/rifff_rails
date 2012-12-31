class RenameProjectsToProject < ActiveRecord::Migration
 
      def change
          rename_table :projects, :project
      end 
 
end
