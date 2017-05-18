class AddColorToTags < ActiveRecord::Migration[5.0]
  def change
    add_column :tags, :color, :string
    add_column :tags, :shape, :string
    add_column :tags, :title, :string
  end
end
