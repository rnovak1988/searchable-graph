class CreateGraphs < ActiveRecord::Migration[5.0]
  def change
    create_table :graphs, id: false do |t|
      t.belongs_to :document, foreign_key: true

      t.timestamps
    end

    add_column :graphs, :id, :string, :limit => 36
    add_index :graphs, :id

    execute 'ALTER TABLE graphs ADD PRIMARY KEY (id);'
  end
end
