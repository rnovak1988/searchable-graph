class Graph < ApplicationRecord
  belongs_to :document

  has_many :nodes
  has_many :edges

  def to_obj
    {
        :id => vis_id
    }
  end

end
