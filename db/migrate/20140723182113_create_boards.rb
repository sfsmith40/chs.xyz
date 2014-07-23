class CreateBoards < ActiveRecord::Migration
  def change
    create_table :boards do |t|
      t.string :slug
      t.text :board
      t.integer :players

      t.timestamps
    end
  end
end
