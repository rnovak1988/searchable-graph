class Document < ApplicationRecord

  belongs_to :user

  has_many :graphs
  has_many :nodes, :through => :graphs
  has_many :edges, :through => :graphs
  has_many :tags, :through => :graphs

  def self.deep_query(user, params)
    self.includes(:graphs => [:nodes => [:node_tags], :edges => [], :tags => []]).joins(:user).where({user: user}).find(params[:id])
  end

  def to_obj

    result = {
        :id       => id,
        :title    => title,
        :graphs   => []
    }

    graphs.each do |graph|

      graph_obj = graph.to_obj

      result[:graphs] << graph_obj unless result[:graphs].include? graph_obj

      graph.nodes.each do |node|
        node_obj = node.to_obj

        graph_obj[:nodes] << node_obj unless graph_obj[:nodes].include? node_obj
      end

      graph.edges.each do |edge|
        edge_obj = edge.to_obj

        graph_obj[:edges] << edge_obj unless graph_obj[:edges].include? edge_obj
      end

      graph.tags.each do |tag|
        tag_obj = tag.to_obj

        graph_obj[:tags] << tag_obj unless graph_obj[:tags].include? tag_obj
      end

    end

    result
  end

end
