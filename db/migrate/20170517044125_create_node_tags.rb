class CreateNodeTags < ActiveRecord::Migration[5.0]
  def change
    create_table :node_tags do |t|
      t.boolean :is_primary
      t.timestamps
    end

    add_column :node_tags, :node_id, :uuid
    add_column :node_tags, :tag_id, :uuid

    add_foreign_key :node_tags, :nodes
    add_foreign_key :node_tags, :tags

    add_index :node_tags, [:node_id, :tag_id], unique: true

  end
end
