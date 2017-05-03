class Document < ApplicationRecord

  belongs_to :user

  has_many :graphs
  has_many :nodes, :through => :graphs
  has_many :edges, :through => :graphs

end
