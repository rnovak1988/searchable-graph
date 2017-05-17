class CreateNodeTags < ActiveRecord::Migration[5.0]
  def change
    create_table :node_tags do |t|
      t.belongs_to :node, foreign_key: true
      t.belongs_to :tag, foreign_key: true

      t.timestamps
    end
  end
end
