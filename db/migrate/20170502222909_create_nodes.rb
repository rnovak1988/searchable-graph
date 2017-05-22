class CreateNodes < ActiveRecord::Migration[5.0]
  def change
    create_table :nodes, id: false do |t|
      t.string :label
      t.text :notes

      t.timestamps
    end

    add_column :nodes, :id, :string, :limit => 36
    add_index :nodes, :id

    add_column :nodes, :graph_id, :string, :limit => 36
    add_foreign_key :nodes, :graphs

    execute 'ALTER TABLE nodes ADD PRIMARY KEY (id);'

  end
end
