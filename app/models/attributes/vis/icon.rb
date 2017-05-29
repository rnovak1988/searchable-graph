module Attributes::Vis
  module Icon

    def icon
      return nil if read_attribute(:icon).nil?
      [read_attribute(:icon)].pack('U')
    end

    def icon=(value)
      if value.is_a?(String) and value.length > 0
        write_attribute(:icon, value.codepoints[0].ord)
      elsif value.is_a?(Integer)
        write_attribute(:icon, value)
      end
    end

  end
end


