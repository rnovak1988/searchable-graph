class DocumentsController < ApplicationController
  before_action :set_csrf_cookie

  before_action :authenticate_user!
  before_action :set_document, only: [:show, :update, :edit, :destroy]



  # GET /documents
  # GET /documents.json
  def index
    @documents = current_user.documents.all
  end

  # GET /documents/1
  # GET /documents/1.json
  def show
    if request.put?
      logger.debug params.inspect
    else
      respond_to do |format|
        format.html
        format.json { render :json => @document.to_obj }
      end
    end
  end

  # GET /documents/new
  def new
    @document = Document.new
  end

  # GET /documents/1/edit
  def edit
  end

  # POST /documents
  # POST /documents.json
  def create
    @document = Document.new(document_params)
    @document.user = current_user

    respond_to do |format|
      if @document.save
        format.html { redirect_to @document, notice: 'Document was successfully created.' }
        format.json { render :show, status: :created, location: @document }
      else
        format.html { render :new }
        format.json { render json: @document.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /documents/1
  # PATCH/PUT /documents/1.json
  def update

    # Technically, the object being transferred as part of the params[:document] parameter is
    # the transfer object that is created as part of graph.js, so it needs to get transformed into
    # native representation so it can be saved

    graphs  = {}
    tags    = {}
    nodes   = {}
    edges   = {}
    clusters= {}

    unless params[:document][:title].nil? || @document.title.eql?(params[:document][:title])
      @document.title = params[:document][:title]
      @document.save!
    end

    # Because apparently ruby doesn't memoize anything
    @document.graphs.each do |graph|
      graphs[graph.id] = graph

      graph.nodes.each do |node|
        nodes[node.id] = node
      end

      graph.edges.each do |edge|
        edges[edge.id] = edge
      end

      graph.tags.each do |tag|
        tags[tag.id] = tag
      end

      graph.clusters.each do |cluster|
        clusters[cluster.id] = cluster
      end

    end

    params[:document][:graphs].each do |graph_obj|

      graphs[graph_obj[:id]] = @document.graphs.create!(id: graph_obj[:id]) unless graphs.has_key?(graph_obj[:id])

    end

    params[:document][:clusters].each do |cluster_obj|

      graph = graphs[cluster_obj[:graph_id]]

      unless graph.nil?

        cluster = clusters[cluster_obj[:id]]

        if cluster.nil?
          cluster = graph.clusters.create!(id: cluster_obj[:id])
          clusters[cluster_obj[:id]] = cluster
        end

        cluster.import cluster_obj

=begin
        cluster.label = cluster_obj[:label] unless cluster_obj[:label].nil? or cluster.label.eql?(cluster_obj[:label])

        if cluster_obj.has_key?(:color) && !cluster.color.eql?(cluster_obj[:color]) && !(cluster_obj[:color].match(%r{\A#(\h{6}|\h{3}|\h)\z}).nil?)
          cluster.color = cluster_obj[:color]
        end

        cluster.shape = cluster_obj[:shape] unless !(cluster_obj.has_key?(:shape)) or cluster_obj[:shape].nil? or cluster.shape.eql?(cluster_obj[:shape])
=end

        cluster.save!

      end

    end

    params[:document][:tags].each do |tag_obj|

      graph = graphs[tag_obj[:graph_id]]

      unless graph.nil?

        tag = tags[tag_obj[:id]]

        if tag.nil?
          tag = graph.tags.create!(id: tag_obj[:id])
          tags[tag_obj[:id]] = tag
        end

        tag.import tag_obj

=begin
        tag.name = tag_obj[:name] unless tag_obj[:name].nil? or tag.name.eql?(tag_obj[:name])

        if tag_obj.has_key?(:color) && !tag.color.eql?(tag_obj[:color]) && !(tag_obj[:color].match(%r{\A#(\h{6}|\h{3}|\h)\z}).nil?)
          tag.color = tag_obj[:color]
        end

        if tag_obj.has_key?(:shape) && !tag.shape.eql?(tag_obj[:shape])
          tag.shape = tag_obj[:shape]
        end
=end

        tag.save!

      end

    end

    params[:document][:nodes].each do |node_obj|

      graph = graphs[node_obj[:graph_id]]

      unless graph.nil?

        node = nodes[node_obj[:id]]

        if node.nil?
          node = graph.nodes.create!(id: node_obj[:id])
          nodes[node_obj[:id]] = node
        end

        node.label = node_obj[:label] unless node_obj[:label].nil? || node.label.eql?(node_obj[:label])
        node.shape = node_obj[:shape] unless node_obj[:shape].nil? || node.shape.eql?(node_obj[:shape])

        if node_obj.has_key?(:x) and node_obj.has_key?(:y)
          node.x = node_obj[:x]
          node.y = node_obj[:y]
        end

        if node_obj.has_key?(:tags) && node_obj[:tags].length > 0

          node.node_tags.each do |node_tag|
            if node_obj[:tags].include?(node_tag.tag_id)
              node_obj[:tags].delete(node_tag.tag_id)
            else
              node_tag.destroy
            end
          end

          node_obj[:tags].each do |tag_id|
            tag = tags[tag_id]
            unless tag.nil?
              node.tags << tag
            end
          end


          if node.node_tags.empty?
            node.primary_tag = nil
          elsif node_obj.has_key?(:group)

            node.primary_tag = nil

            unless node_obj[:group].nil? || !tags.has_key?(node_obj[:group])
              node.primary_tag = tags[node_obj[:group]]
            end

          end

        else
          node.node_tags.destroy_all
          node.primary_tag = nil
        end

        if node_obj.has_key?(:cluster) && !node_obj[:cluster].nil?
          cluster = clusters[node_obj[:cluster]]
          unless cluster.nil?
            node.cluster = cluster
          end
        else
          node.cluster = nil
        end

        node.icon = node_obj[:icon] if node_obj.has_key?(:icon)

        node.save!

      end

    end

    params[:document][:edges].each do |edge_obj|

      graph = graphs[edge_obj[:graph_id]]
      node_from = nodes[edge_obj[:from]]
      node_to = nodes[edge_obj[:to]]

      unless graph.nil? || node_from.nil? || node_to.nil?

        edge = edges[edge_obj[:id]]

        if edge.nil?

          edge = graph.edges.new(id: edge_obj[:id], node_from: node_from, node_to: node_to)
          edges[edge_obj[:id]] = edge

        end

        edge.label = edge_obj[:label] unless edge_obj[:label].nil? || edge.label.eql?(edge_obj[:label])
        edge.save!

      end
    end

    params[:document][:removed_edges].each do |vis_id|
      edge = edges[vis_id]
      unless edge.nil?
        edge.destroy
        edges.delete(vis_id)
      end
    end

    params[:document][:removed_nodes].each do |vis_id|
      node = nodes[vis_id]
      unless node.nil?
        node.destroy
        nodes.delete(vis_id)
      end
    end

    head :no_content
  end



  # DELETE /documents/1
  # DELETE /documents/1.json
  def destroy
    @document.destroy
    respond_to do |format|
      format.html { redirect_to documents_url, notice: 'Document was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_document
      @document = Document.includes(:graphs => [:nodes => [:node_tags => [:tag]], :edges => [:node_from, :node_to], :tags => [], :clusters => []]).joins(:user).where(user: current_user).find(params[:id])
    end


    # Never trust parameters from the scary internet, only allow the white list through.
    def document_params

      params.require(:document).permit(:id, :title, :removed_edges, :removed_nodes,
                                       :graphs => [:id],
                                       :nodes => [:id, :graph_id, :label, :shape, :tags, :group, :cluster, :icon, :x, :y],
                                       :edges => [:id, :graph_id, :label, :from, :to],
                                        :tags => [:id, :name, :graph_id, :color, :shape, :icon],
                                      :clusters => [:id, :title, :label, :graph_id, :color, :shape, :icon])
    end

  protected
    def set_csrf_cookie
      if protect_against_forgery?
        cookies['XSRF-TOKEN'] = form_authenticity_token
      end
    end

  def verified_request?
    super || valid_authenticity_token?(session, request.headers['X-XSRF-TOKEN'])
  end
end
