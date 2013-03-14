require 'test_helper'

class InDemandsControllerTest < ActionController::TestCase
  setup do
    @in_demand = in_demands(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:in_demands)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create in_demand" do
    assert_difference('InDemand.count') do
      post :create, in_demand: {  }
    end

    assert_redirected_to in_demand_path(assigns(:in_demand))
  end

  test "should show in_demand" do
    get :show, id: @in_demand
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @in_demand
    assert_response :success
  end

  test "should update in_demand" do
    put :update, id: @in_demand, in_demand: {  }
    assert_redirected_to in_demand_path(assigns(:in_demand))
  end

  test "should destroy in_demand" do
    assert_difference('InDemand.count', -1) do
      delete :destroy, id: @in_demand
    end

    assert_redirected_to in_demands_path
  end
end
