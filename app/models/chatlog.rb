class Chatlog < ActiveRecord::Base
  belongs_to :board
  has_many :chatmsgs
end
