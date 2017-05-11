class CreateTags < ActiveRecord::Migration[5.0]
  def change
    create_table :tags do |t|
      t.belongs_to :graph, foreign_key: true
      t.string :name
      t.timestamps
    end

    add_column :tags, :vis_id, :uuid
    add_index :tags, :vis_id

  end
end
