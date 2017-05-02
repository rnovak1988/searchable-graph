class CreateNodes < ActiveRecord::Migration[5.0]
  def change
    create_table :nodes do |t|
      t.belongs_to :graph, foreign_key: true
      t.string :label
      t.text :notes

      t.timestamps
    end
  end
end
