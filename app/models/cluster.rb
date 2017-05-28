class Cluster < VisObject

  belongs_to :graph

  def to_obj
    result = {
        :id         => id,
        :graph_id   => graph_id,
        :label      => label,
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
