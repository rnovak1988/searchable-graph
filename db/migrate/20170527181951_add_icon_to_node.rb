class AddIconToNode < ActiveRecord::Migration[5.0]
  def change
    add_column :nodes, :icon, :integer, :null => true
  end
end
