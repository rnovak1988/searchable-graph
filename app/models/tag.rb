class Tag < ApplicationRecord
  belongs_to :graph

  def to_obj
    {
        id: vis_id,
        graph_id: graph.vis_id,
        name: name
    }
  end
end