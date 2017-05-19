class Edge < ApplicationRecord
  belongs_to :graph

  belongs_to :node_from, class_name: Node
  belongs_to :node_to, class_name: Node


  def to_obj
    {
        :id         => id,
        :from       => node_from_id,
        :to         => node_to_id,
        :graph_id   => graph_id,
        :label      => "#{label}"
    }
  end

end
