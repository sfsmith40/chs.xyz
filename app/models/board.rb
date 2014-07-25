class Board < ActiveRecord::Base

  before_create :gen_slug

  has_one :chatlog

  def has_player_waiting
    if self.has_white_player and !self.has_black_player
      'black'
    elsif self.has_black_player and !self.has_white_player
      'white'
    else 
      false
    end
  end

  private

  def gen_slug
    begin
      self.slug = ('a'..'z').to_a.shuffle[0,3].join
    end while Board.find_by_slug(self.slug) and self.slug != 'new'
  end
end
