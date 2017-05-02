class CreateGraphs < ActiveRecord::Migration[5.0]
  def change
    create_table :graphs do |t|
      t.belongs_to :document, foreign_key: true

      t.timestamps
    end
  end
end
