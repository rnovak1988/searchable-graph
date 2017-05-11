class AddVisIdToEdges < ActiveRecord::Migration[5.0]
  def change
    add_column :edges, :vis_id, :uuid
    add_index :edges, :vis_id
  end
end
