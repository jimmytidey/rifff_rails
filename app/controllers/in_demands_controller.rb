class InDemandsController < ApplicationController
  # GET /in_demands
  # GET /in_demands.json
  def index
    @in_demands = InDemand.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @in_demands }
    end
  end

  # GET /in_demands/1
  # GET /in_demands/1.json
  def show
    @in_demand = InDemand.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @in_demand }
    end
  end

  # GET /in_demands/new
  # GET /in_demands/new.json
  def new
    @in_demand = InDemand.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @in_demand }
    end
  end

  # GET /in_demands/1/edit
  def edit
    @in_demand = InDemand.find(params[:id])
  end

  # POST /in_demands
  # POST /in_demands.json
  def create
    @in_demand = InDemand.new(params[:in_demand])

    respond_to do |format|
      if @in_demand.save
        format.html { redirect_to @in_demand, notice: 'In demand was successfully created.' }
        format.json { render json: @in_demand, status: :created, location: @in_demand }
      else
        format.html { render action: "new" }
        format.json { render json: @in_demand.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /in_demands/1
  # PUT /in_demands/1.json
  def update
    @in_demand = InDemand.find(params[:id])

    respond_to do |format|
      if @in_demand.update_attributes(params[:in_demand])
        format.html { redirect_to @in_demand, notice: 'In demand was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @in_demand.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /in_demands/1
  # DELETE /in_demands/1.json
  def destroy
    @in_demand = InDemand.find(params[:id])
    @in_demand.destroy

    respond_to do |format|
      format.html { redirect_to in_demands_url }
      format.json { head :no_content }
    end
  end
end
