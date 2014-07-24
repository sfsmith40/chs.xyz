class CreateChatmsgs < ActiveRecord::Migration
  def change
    create_table :chatmsgs do |t|
      t.integer :chatlog_id
      t.string :player
      t.string :text

      t.timestamps
    end
  end
end
