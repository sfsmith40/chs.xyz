class CreateChatlogs < ActiveRecord::Migration
  def change
    create_table :chatlogs do |t|
      t.integer :board_id
      t.string :board_slug

      t.timestamps
    end
  end
end
