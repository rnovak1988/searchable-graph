class Tag < ApplicationRecord
  belongs_to :graph

  has_many :node_tags
  has_many :nodes, through: :node_tags

  def to_obj
    {
        id: vis_id,
        graph_id: graph.vis_id,
        name: name
    }
  end
end
