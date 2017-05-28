namespace :graph_icons do

  desc 'parse icons from the stuff'
  task :parse => :environment do


    class_name_regex = %r{\A\.fa-([a-zA-Z0-9_-]+):before}
    unicode_regex = %r{content:\s+"\\(.+)";}

    ico = nil

    File.open("#{Rails.root}/app/assets/stylesheets/font-awesome.css", "r").each do |line|
      if classz = class_name_regex.match(line)
        ico = FontAwesomeIcon.find_or_initialize_by(name: classz[1])
      elsif ico != nil && code = unicode_regex.match(line)
        ico.code = code[1].hex
        ico.save!
        ico = nil
      end
    end

  end
end
