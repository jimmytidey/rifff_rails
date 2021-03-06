class ProjectsController < ApplicationController
  
  before_filter :authenticate_user!,
    :only => [:index, :edit,:save_json, :create, :new]
  
  before_filter :create_user
  
  def index 
    @projects = @user.projects
    @project = Project.new
  end

  def new
    @project = Project.new
    flash[:notice] = "new project"
  end
  
  def create
    @project = @user.projects.new(params[:project])
    @project.json = File.read(Rails.root.join('app/assets/json/list.json'))
    if @project.save
      flash[:notice] = "saved"
      redirect_to projects_path
    else 
      flash[:error] = "did not save"
    end   
  end
  
  def iframe 
    @project = Project.find(params[:id])
    @sound_files = @project.sound_files
    @sound_file = SoundFile.new    
    render :layout => "iframe"
  end

  def duplicate  
    @project = Project.find(params[:id])
    @sound_files = @project.sound_files
    @sound_file = SoundFile.new    
    render :layout => "bare"
  end
  
  def show 
    @project = Project.find(params[:id])
    @sound_files = @project.sound_files
    @sound_file = SoundFile.new    
    render :layout => "show_audio"
  end
  
  def edit 
    @project = Project.find(params[:id])
    @sound_files = @project.sound_files
    @sound_file = SoundFile.new   
    render :layout => "edit_audio" 
  end
  
  def save_json
    @project = Project.find(params[:id])
    
    if @project.update_attributes(:json => params[:json])
      respond_to do |format|
        format.json { render json: @project, status: :created, location: @sound_file }
      end 
    else   
      respond_to do |format|
        format.json { render json: @project.errors, status: :unprocessable_entity  }
      end
    end 
  end  
  
  def list_files 
    @project = Project.find(params[:id])
    @sound_files = @project.sound_files
    respond_to do |format|
      format.json { render :json => @sound_files}
    end
  end 
  
  private 
    
  def create_user 
    @user = current_user
  end 
    
end
