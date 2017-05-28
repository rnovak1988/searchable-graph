module VisAttributes
  extend ActiveSupport::Concern

  COLOR_REGEX = %r{\A#([0-9a-fA-F]{1}|[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\z}

  class Attribute

    def self.validate(attr, this, other)

      return true unless this.nil?      or
          other.nil?                    or
          not this.has_attribute?(attr) or
          not other.has_key?(attr)      or
          this.read_attribute(attr).eql?(other[attr])

      false
    end

  end


  def import(hash)
    %w{label title shape name}.map(&:to_sym).each do |attr|

      if Attribute.validate(attr, self, hash)
        write_attribute(attr, hash[attr])
      end

    end

    if has_attribute?(:color)

      write_attribute(:color, nil) if hash[:color].nil?

      unless hash[:color].nil? or read_attribute(:color).eql?(hash[:color]) or COLOR_REGEX.match(hash[:color]).nil?

        write_attribute(:color, hash[:color])

      end

    end

    if has_attribute?(:icon)
      this_shape = read_attribute('shape')

      if this_shape.eql?('icon')

        if hash[:icon].nil?
          write_attribute(:shape, nil)
          write_attribute(:icon, nil)
        else

          icon_value = hash[:icon].ord

          unless icon_value < FontAwesomeIcon.minimum(:code) or icon_value > FontAwesomeIcon.maximum(:code)

            write_attribute(:icon, icon_value)

          end

        end

      else
        write_attribute(:icon, nil)
      end

    end

  end


  def serialize_vis
    result = {}
    %w{id title label shape color graph_id}.map(&:to_sym).each do |sym|

      if has_attribute?(sym)
        result[sym] = read_attribute(sym)
      end

    end

    if has_attribute?(:icon)
      result[:icon] = read_attribute('shape').eql?('icon') ? [read_attribute(:icon)].pack('U') : nil
    end

    return result
  end


end