class WelcomeController < ApplicationController
  def index
    @project = Project.new
    @projects = Project.find(:all) 
  end
end
