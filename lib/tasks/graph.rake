require 'roo/spreadsheet'
namespace :graph do

  desc "TODO"
  task :import, [:filename] => :environment do |t, args|
    unless args[:filename].nil? or not File.exists?(args[:filename]) or not File.readable?(args[:filename])

      g = Graph.first

      file = Roo::Spreadsheet.open(args[:filename], :extension => :xlsx)

      file.each_with_pagename do |name, sheet|
        header = sheet.row(1)
        hostname_index = header.find_index {|o| o.match /hostname/i }

        index = 3
        while (index <= sheet.last_row)

          row = sheet.row(index)

          hostname = row[hostname_index]

          if data = hostname.match(/\A[^\.]+\.([^\.]+\.)?ccbill\.(local|com)\z/i)
            Node.create!(graph: g, label: hostname)
          end

          index += 1
        end


      end


    end
  end

end
