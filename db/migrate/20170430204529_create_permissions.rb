class CreatePermissions < ActiveRecord::Migration[5.0]
  def change
    create_table :permissions do |t|
      t.belongs_to :user, foreign_key: true
      t.belongs_to :document, foreign_key: true
      t.boolean :can_read
      t.boolean :can_write

      t.timestamps
    end
  end
end
