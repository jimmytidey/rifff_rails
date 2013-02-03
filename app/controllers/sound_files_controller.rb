class SoundFilesController < ApplicationController
  # GET /sound_files
  # GET /sound_files.json

  before_filter :load_parent
  
  def index
    @sound_files = SoundFile.all
    @sound_file = SoundFile.new
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @sound_files }
    end
  end

  # GET /sound_files/1
  # GET /sound_files/1.json
  def show
    @sound_file = SoundFile.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @sound_file }
    end
  end

  # GET /sound_files/new
  # GET /sound_files/new.json
  def new
    @sound_file = @project.soundfile.new
    
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @sound_file }
    end
  end

  # GET /sound_files/1/edit
  def edit
    @sound_file = SoundFile.find(params[:id])
  end

  # POST /sound_files
  # POST /sound_files.json
  def create
    @sound_file = @project.sound_files.create(params[:sound_file])
  end

  # PUT /sound_files/1
  # PUT /sound_files/1.json
  def update
    @sound_file = SoundFile.find(params[:id])
    respond_to do |format|
      if @sound_file.update_attributes(params[:sound_file])
        format.html { redirect_to @sound_file, notice: 'Sound file was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @sound_file.errors, status: :unprocessable_entity }
      end
    end
  end


  def destroy
    @sound_file = SoundFile.find(params[:id])
    @sound_file.destroy

    respond_to do |format|
      format.html { redirect_to @project }
      format.js { render 'destroy.js.erb' }
    end
  end
  
  private
   
  def load_parent
    @project = Project.find(params[:project_id])
  end  
  
end
