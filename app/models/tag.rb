class Tag < ApplicationRecord
  belongs_to :graph

  has_many :node_tags
  has_many :nodes, through: :node_tags

  def to_obj
    {
        :id         => id,
        :graph_id   => graph_id,
        :name       => name
    }
  end
end
