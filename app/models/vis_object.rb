class VisObject < ApplicationRecord
  self.abstract_class = true
  include VisAttributes

end