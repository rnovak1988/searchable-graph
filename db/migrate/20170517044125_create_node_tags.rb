class CreateNodeTags < ActiveRecord::Migration[5.0]
  def change
    create_table :node_tags do |t|
      t.timestamps
    end

    add_column :node_tags, :node_id, :string, :limit => 36
    add_index :node_tags, :node_id

    add_column :node_tags, :tag_id, :string, :limit => 36
    add_index :node_tags, :tag_id

    add_foreign_key :node_tags, :nodes
    add_foreign_key :node_tags, :tags

    add_index :node_tags, [:node_id, :tag_id], unique: true

    add_column :nodes, :primary_tag_id, :string, :length => 36
    add_foreign_key :nodes, :tags, :column => :primary_tag_id, :null => true


  end
end
