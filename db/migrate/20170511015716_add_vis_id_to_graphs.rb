class AddVisIdToGraphs < ActiveRecord::Migration[5.0]
  def change
    add_column :graphs, :vis_id, :uuid
    add_index :graphs, :vis_id
  end
end
