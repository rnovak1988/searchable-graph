class Cluster < VisObject
  include Attributes::Vis::Icon

  belongs_to :graph

  def to_obj
    result = {
        :id         => id,
        :graph_id   => graph_id,
        :label      => label,
        :shape      => shape,
        :_icon       => icon,
        :color      => color
    }
    return result
  end

end
