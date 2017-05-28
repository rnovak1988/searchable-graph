class CreateFontAwesomeIcons < ActiveRecord::Migration[5.0]
  def change
    create_table :font_awesome_icons, id: false do |t|
      t.string :name
      t.integer :code
    end

    execute 'ALTER TABLE font_awesome_icons ADD PRIMARY KEY (name, code)'
  end
end
