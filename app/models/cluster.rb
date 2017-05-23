class Cluster < ApplicationRecord

  belongs_to :graph

  def to_obj
    {
        :id         => id,
        :graph_id   => graph_id,
        :label      => label,
        :shape      => shape,
        :color      => color
    }
  end

end
