class Edge < ApplicationRecord
  belongs_to :graph

  belongs_to :node_from, class_name: Node
  belongs_to :node_to, class_name: Node


  ##
  # implementation of eql? This is implented so we can use Edge as a key into a hash

  def eql?(other)
    if other.instance_of?(Edge)
      if self.hash == other.hash
        true
      end
    else
      false
    end
  end

  ##
  # implementation of hash function, which uniquely identifies an edge by comparing it against a graph,
  # and the Edges that it links to

  def hash
    result = 7
    result = 31 * result + graph.hash
    result = 31 * result + node_from_id
    result = 31 * result + node_to_id
    return result
  end

end
