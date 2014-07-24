class Board < ActiveRecord::Base

  before_create :gen_slug

  has_one :chatlog

  def to_param
    slug
  end

  private

  def gen_slug
    begin
      self.slug = ('a'..'z').to_a.shuffle[0,3].join
    end while Board.find_by_slug(self.slug)
  end
end
