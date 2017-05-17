class NodeTag < ApplicationRecord
  belongs_to :node, required: false
  belongs_to :tag



end
