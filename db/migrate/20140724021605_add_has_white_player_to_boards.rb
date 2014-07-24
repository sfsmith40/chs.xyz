class AddHasWhitePlayerToBoards < ActiveRecord::Migration
  def change
    add_column :boards, :has_white_player, :boolean
  end
end
