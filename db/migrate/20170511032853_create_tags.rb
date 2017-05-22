class CreateTags < ActiveRecord::Migration[5.0]
  def change
    create_table :tags, id: false do |t|
      t.string :name
      t.timestamps
    end

    add_column :tags, :id, :string, :limit => 36
    add_index :tags, :id

    add_column :tags, :graph_id, :string, :limit => 36
    add_foreign_key :tags, :graphs, column: :graph_id

    execute 'ALTER TABLE tags ADD PRIMARY KEY (id);'
  end
end
