class FontAwesomeIcon < ApplicationRecord

  def code
    [read_attribute('code')].pack('U')
  end

end
