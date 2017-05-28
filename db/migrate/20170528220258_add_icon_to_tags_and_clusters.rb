class AddIconToTagsAndClusters < ActiveRecord::Migration[5.0]
  def change

    add_column :tags, :icon, :integer, :null => true
    add_column :clusters, :icon, :integer, :null => true

    remove_column :tags, :title

  end
end
