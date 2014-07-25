class AddBlackPlayerToBoards < ActiveRecord::Migration
  def change
    add_column :boards, :black_player, :string
  end
end
