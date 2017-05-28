class VisIcon < ActiveRecord::Type::Integer

  def serialize(value)
    if value.is_a?(String) and value.length > 0
      value.codepoints[0].ord
    elsif value.is_a?(Integer)
      value
    else
      super
    end
  end

  def deserialize(value)
    if value.is_a?(String) and value.length > 0
      value.codepoints[0].ord
    elsif value.is_a?(Integer)
      value
    else
      super
    end
  end

end