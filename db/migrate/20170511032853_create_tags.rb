class CreateTags < ActiveRecord::Migration[5.0]
  def change
    create_table :tags, id: :uuid do |t|
      t.string :name
      t.timestamps
    end

    add_column :tags, :graph_id, :uuid
    add_foreign_key :tags, :graph_id

  end
end
