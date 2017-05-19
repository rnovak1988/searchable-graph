class CreateEdges < ActiveRecord::Migration[5.0]
  def change
    create_table :edges, id: :uuid do |t|
      t.string :label

      t.timestamps
    end

    add_column :edges, :graph_id, :uuid
    add_column :edges, :node_from_id, :uuid
    add_column :edges, :node_to_id, :uuid

    add_foreign_key :edges, :graphs
    add_foreign_key :edges, :nodes, :column => :node_from_id
    add_foreign_key :edges, :nodes, :column => :node_to_id


  end
end
