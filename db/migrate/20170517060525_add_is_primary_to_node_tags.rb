class AddIsPrimaryToNodeTags < ActiveRecord::Migration[5.0]
  def change
    add_column :node_tags, :is_primary, :boolean
  end
end
