class DocumentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_document, only: [:edit, :update, :destroy]

  # GET /documents
  # GET /documents.json
  def index
    @documents = current_user.documents.all
  end

  # GET /documents/1
  # GET /documents/1.json
  def show
    respond_to do |format|
      format.html
      format.json { render :json => query_document }
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
    respond_to do |format|
      if @document.update(document_params)
        format.html { redirect_to @document, notice: 'Document was successfully updated.' }
        format.json { render :show, status: :ok, location: @document }
      else
        format.html { render :edit }
        format.json { render json: @document.errors, status: :unprocessable_entity }
      end
    end
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
              :nodes => [],
              :edges => []
          }
        end

        graphs[graph_id][:nodes] << {id: node.id, label: node.label}

      end

      document.edges.each do |edge|

        graph_id = edge.graph.id

        from = edge.node_from_id
        to = edge.node_to_id

        unless seen.has_key? from
          seen[from] = []
        end

        unless seen.has_key? to
          seen[to] = []
        end

        unless seen[from].include?(to)
          seen[from][to] = 1
          graphs[graph_id][:edges] << {from: from, to: to}
        end

      end

      result = {:title => document.title, :graphs => graphs.values}
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def document_params

      params.require(:document).permit(:title)
    end
end
