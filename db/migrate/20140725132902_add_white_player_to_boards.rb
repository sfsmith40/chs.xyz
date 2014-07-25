class AddWhitePlayerToBoards < ActiveRecord::Migration
  def change
    add_column :boards, :white_player, :string
  end
end
