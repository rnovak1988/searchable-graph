class Edge < ApplicationRecord
  belongs_to :graph

  belongs_to :node_from, class_name: Node
  belongs_to :node_to, class_name: Node

end
