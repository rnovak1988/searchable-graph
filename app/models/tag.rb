class Tag < VisObject

  belongs_to :graph

  has_many :node_tags
  has_many :nodes, through: :node_tags

  def to_obj
    result = {
        :id         => id,
        :graph_id   => graph_id,
        :name       => name,
        :color      => color
    }

    if icon.nil?
      result[:shape] = shape unless shape.eql?('icon')
    else
      result[:shape] = 'icon'
      result[:_icon] = [icon].pack('U')
    end

    return result
  end
end
