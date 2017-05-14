class Document < ApplicationRecord

  belongs_to :user

  has_many :graphs
  has_many :nodes, :through => :graphs
  has_many :edges, :through => :graphs
  has_many :tags, :through => :graphs

  def self.deep_query(user, params)
    self.includes(:graphs => [], :nodes => [], :edges => [:node_from, :node_to], :tags => []).joins(:user).where({user: user}).find(params[:id])
  end

end
