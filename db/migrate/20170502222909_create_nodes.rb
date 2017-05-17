class CreateNodes < ActiveRecord::Migration[5.0]
  def change
    create_table :nodes, id: :uuid do |t|
      t.string :label
      t.text :notes

      t.timestamps
    end

    add_column :nodes, :graph_id, :uuid
    add_foreign_key :nodes, :graphs

  end
end
