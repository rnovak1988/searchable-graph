class CreateEdges < ActiveRecord::Migration[5.0]
  def change
    create_table :edges do |t|
      t.belongs_to :graph, foreign_key: true
      t.integer :node_from_id
      t.integer :node_to_id
      t.string :label

      add_foreign_key :edges, :nodes, :node_from_id
      add_foreign_key :edges, :nodes, :node_to_id

      t.timestamps
    end
  end
end
