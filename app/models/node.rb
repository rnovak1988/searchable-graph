class Node < ApplicationRecord
  belongs_to :graph

  has_many :edges_from, :class_name => Edge, foreign_key: :node_from_id, dependent: :destroy
  has_many :edges_to, :class_name => Edge, foreign_key: :node_to_id, dependent: :destroy

  has_many :children, :through => :edges_from, :class_name => Node, :source => :node_to
  has_many :parents, :through => :edges_to, :class_name => Node, :source => :node_from

  has_many :node_tags, dependent: :destroy
  has_many :tags, through: :node_tags

  belongs_to :primary_tag, :class_name => Tag, :optional => true

  accepts_nested_attributes_for :node_tags, :allow_destroy => true

  def edges
    Edge.where('node_from_id = ? or node_to_id = ?', id, id)
  end


  def to_obj
    {
        :id       => id,
        :label    => label,
        :graph_id => graph_id,
        :shape    => vis_shape,
        :tags     => node_tags.map(&:tag_id),
        :group    => primary_tag_id
    }
  end

end
