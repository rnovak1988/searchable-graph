class Graph < ApplicationRecord
  belongs_to :document

  has_many :nodes
  has_many :edges

end
