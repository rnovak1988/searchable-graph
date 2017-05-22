class CreateEdges < ActiveRecord::Migration[5.0]
  def change
    create_table :edges, id: false do |t|
      t.string :label

      t.timestamps
    end

    add_column :edges, :id, :string, :limit => 36
    add_index :edges, :id

    add_column :edges, :graph_id, :string, :limit => 36
    add_column :edges, :node_from_id, :string, :limit => 36
    add_column :edges, :node_to_id, :string, :limit => 36

    add_foreign_key :edges, :graphs
    add_foreign_key :edges, :nodes, :column => :node_from_id
    add_foreign_key :edges, :nodes, :column => :node_to_id

    execute 'ALTER TABLE edges ADD PRIMARY KEY (id)'

  end
end
