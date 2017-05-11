class DocumentsController < ApplicationController
  before_action :set_csrf_cookie

  before_action :authenticate_user!
  before_action :set_document, only: [:edit, :destroy]

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
        format.json { render :json => query_document }
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

    seen_edges = {}

    document = Document.includes(:graphs, :nodes, :edges).joins(:user).where({user: current_user}).find(params[:id])

    document.title = params[:document]['title']

    document.save!

    graphs = {}
    nodes = {}
    edges = []

    params[:document][:graphs].each do |g|

      vis_id = g['id']
      graph = nil

      graph = document.graphs.find_or_initialize_by(vis_id: vis_id)

      graph.save!
      graphs[vis_id] = graph

    end

    params[:document][:nodes].each do |n|

      vis_id = n['id']
      label = n['label']
      graph_id = n['graph_id']

      node = document.nodes.find_or_initialize_by(vis_id: vis_id)

      node.label = label
      node.graph = graphs[graph_id]

      nodes[vis_id] = node

      node.save!
    end

    params[:document][:edges].each do |e|

      edge = nil

      vis_id = e['id']
      node_from_vis_id = e['from']
      node_to_vis_id = e['to']

      graph_vis_id = e['graph_id']

      edge = document.edges.find_or_initialize_by(vis_id: vis_id)

      unless e['label'].nil? || e['label'].eql?(edge.label)
        edge.label = e['label']
      end

      edge.graph = graphs[graph_vis_id]
      edge.node_from = nodes[node_from_vis_id]
      edge.node_to = nodes[node_to_vis_id]

      unless seen_edges.has_key? edge
        seen_edges[edge] = vis_id
      end

      edge.save!
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
      @document = Document.joins(:user).where({user: current_user}).find(params[:id])
    end

      # query document from the database and create a structure that is conducive to serialization
    def query_document

      graphs = {}
      seen = {}

      document = Document.includes(:graphs, :nodes, :edges).joins(:user).where({user: current_user}).find(params[:id])

      document.nodes.each do |node|

        node_data = node.to_obj
        graph_id = node_data[:graph_id]

        unless graphs.has_key? graph_id
          graphs[graph_id] = {
              :id => graph_id,
              :nodes => [],
              :edges => []
          }
        end

        graphs[graph_id][:nodes] << node_data

      end

      document.edges.each do |edge|

        edge_data = edge.to_obj

        unless seen.has_key? edge
          seen[edge] = true
          graphs[edge_data[:graph_id]][:edges] << edge_data
        end

      end

      document.graphs.each do |g|
        unless graphs.has_key? g.vis_id
          graphs[g.vis_id] = {
              :id => g.vis_id,
              :nodes => [],
              :edges => []
          }
        end
      end

      result = {:id => document.id, :title => document.title, :graphs => graphs.values}
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def document_params

      params.require(:document).permit(:id, :title, :graphs => [:id], :nodes => [:id, :graph_id, :label], :edges => [:id, :graph_id, :label, :from, :to])
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
