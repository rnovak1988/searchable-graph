class AddVisIdToNodes < ActiveRecord::Migration[5.0]
  def change
    add_column :nodes, :vis_id, :uuid
    add_index :nodes, :vis_id
  end
end
