class AddHasBlackPlayerToBoards < ActiveRecord::Migration
  def change
    add_column :boards, :has_black_player, :boolean
  end
end
