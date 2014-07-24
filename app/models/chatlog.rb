class Chatlog < ActiveRecord::Base
  belongs_to :board
  has_many :chatmsgs

  def included_msgs
    self.chatmsgs.order('created_at DESC').limit(15)
  end
end
