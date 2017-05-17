class Graph < ApplicationRecord
  belongs_to :document

  has_many :nodes
  has_many :edges
  has_many :tags

  def to_obj
    {
        :id => id
    }
  end

end
