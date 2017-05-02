class Node < ApplicationRecord
  belongs_to :graph

  has_many :edges_from, :class_name => Edge, foreign_key: :node_from_id
  has_many :edges_to, :class_name => Edge, foreign_key: :node_to_id

  has_many :children, :through => :edges_from, :class_name => Node, :source => :node_to
  has_many :parents, :through => :edges_to, :class_name => Node, :source => :node_from

end
