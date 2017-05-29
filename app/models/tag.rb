class Tag < VisObject
  include Attributes::Vis::Icon

  belongs_to :graph

  has_many :node_tags
  has_many :nodes, through: :node_tags

  def to_obj
    result = {
        :id         => id,
        :graph_id   => graph_id,
        :shape      => shape,
        :_icon      => icon,
        :icon       => {
            :face => 'FontAwesome'
        },
        :name       => name,
        :color      => color
    }

    result[:icon][:code] = result[:_icon]

    return result
  end
end
