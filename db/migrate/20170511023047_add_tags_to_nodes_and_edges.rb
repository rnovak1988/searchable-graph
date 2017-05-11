class AddTagsToNodesAndEdges < ActiveRecord::Migration[5.0]
  def change
    add_column :nodes, :vis_tag_id, :uuid
  end
end
