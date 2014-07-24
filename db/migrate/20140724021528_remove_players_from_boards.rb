class RemovePlayersFromBoards < ActiveRecord::Migration
  def change
    remove_column :boards, :players, :integer
  end
end
