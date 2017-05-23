class CreateClusters < ActiveRecord::Migration[5.0]
  def change
    create_table :clusters, id: false do |t|
      t.string :shape
      t.string :color
      t.string :label

      t.timestamps
    end

    add_column :clusters, :id, :string, :limit => 36
    execute 'ALTER TABLE clusters ADD PRIMARY KEY(id);'

    add_column :clusters, :graph_id, :string, :limit => 36
    add_foreign_key :clusters, :graphs, :column => :graph_id

  end
end
