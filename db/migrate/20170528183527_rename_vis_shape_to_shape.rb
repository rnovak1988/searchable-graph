class RenameVisShapeToShape < ActiveRecord::Migration[5.0]
  def change

    rename_column :nodes, :vis_shape, :shape

  end
end
