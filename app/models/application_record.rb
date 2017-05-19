class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  before_validation :generate_uuid

  def to_obj
    raise(NotImplementedError)
  end

  def generate_uuid
    unless !self.has_attribute?('id') || self.type_for_attribute('id').type.eql?(:integer)
      if read_attribute('id').nil?
        write_attribute('id', SecureRandom.uuid)
      end
    end
  end

  private

  def attributes_protected_by_default
    if self.type_for_attribute('id').type.eql?(:integer)
      super
    else
      []
    end
  end

end
