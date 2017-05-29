class AddPositionToNodes < ActiveRecord::Migration[5.0]
  def change
    add_column :nodes, :x, :integer
    add_column :nodes, :y, :integer
  end
end
