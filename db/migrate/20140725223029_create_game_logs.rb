class CreateGameLogs < ActiveRecord::Migration
  def change
    create_table :game_logs do |t|
      t.text :log

      t.timestamps
    end
  end
end
