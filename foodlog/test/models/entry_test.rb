require 'test_helper'

class EntryTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  test "is valid with valid attributes" do
    entry = Entry.new(meal_type: "Breakfast", calories: 300, proteins: 40, carbohydrates: 23, fats: 25)
    assert entry.save
  end

  test "should not save entry without meal-type" do
  end

  test "should not save entry without calories" do
  end

  test "should not save entry without proteins" do
  end

  test "should not save entry without carbohydrate" do
  end

  test "should not save entry without fats" do
  end
end
