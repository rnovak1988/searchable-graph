class Graph < VisObject
  belongs_to :document

  has_many :clusters
  has_many :nodes
  has_many :edges
  has_many :tags

  def to_obj
    {
        :id         => id,
        :nodes      => [],
        :edges      => [],
        :tags       => [],
        :clusters   => []
    }
  end

end
