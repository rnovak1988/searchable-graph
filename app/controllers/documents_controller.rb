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
      graph_id = g['id']
      graph = nil

      if graph_id.is_a? Integer
        graph = Graph.find(g['id'])
      else
        graph = Graph.new(document: document)
      end
      graph.save!
      graphs[g['id']] = graph
    end

    params[:document][:nodes].each do |n|

      id = n['id']
      label = n['label']
      graph_id = n['graph_id']

      node = nil

      if id.is_a? Integer
        node = Node.find(id)
      else
        node = Node.new
      end

      node.label = label
      node.graph = graphs[graph_id]

      nodes[id] = node

      node.save!
    end

    params[:document][:edges].each do |e|

      edge = nil

      id = e['id']
      node_from = e['from']
      node_to = e['to']

      graph_id = e['graph_id']

      if id.is_a? Integer
        edge = Edge.find(id)
      else
        edge = Edge.new
      end

      edge.graph = graphs[graph_id]
      edge.node_from = nodes[node_from]
      edge.node_to = nodes[node_to]

      unless seen_edges.has_key? edge
        seen_edges[edge] = id
      end

      edge.save!
    end

    logger.debug graphs.inspect

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

        graph_id = node.graph.id

        unless graphs.has_key? graph_id
          graphs[graph_id] = {
              :id => graph_id,
              :nodes => [],
              :edges => []
          }
        end

        graphs[graph_id][:nodes] << {id: node.id, label: node.label}

      end

      document.edges.each do |edge|

        graph_id = edge.graph_id

        from = edge.node_from_id
        to = edge.node_to_id

        unless seen.has_key? edge
          seen[edge] = true
          graphs[graph_id][:edges] << {id: edge.id, graph_id: graph_id, from: from, to: to}
        end

      end

      document.graphs.each do |g|
        unless graphs.has_key? g.id
          graphs[g.id] = {
              :id => g.id,
              :nodes => [],
              :edges => []
          }
        end
      end

      result = {:id => document.id, :title => document.title, :graphs => graphs.values}
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def document_params

      params.require(:document).permit(:id, :title, :graphs => [:id], :nodes => [:id, :graph_id, :label], :edges => [:id, :graph_id, :from, :to])
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
