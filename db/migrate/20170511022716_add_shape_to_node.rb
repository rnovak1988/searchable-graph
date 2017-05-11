class AddShapeToNode < ActiveRecord::Migration[5.0]
  def change
    add_column :nodes, :vis_shape, :string
  end
end
