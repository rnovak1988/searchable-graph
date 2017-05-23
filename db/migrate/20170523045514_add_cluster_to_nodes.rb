class AddClusterToNodes < ActiveRecord::Migration[5.0]
  def change
    add_column :nodes, :cluster_id, :string, :limit => 36, :null => true
    add_foreign_key :nodes, :clusters, :column => :cluster_id
  end
end
