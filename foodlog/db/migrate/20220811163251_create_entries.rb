class CreateEntries < ActiveRecord::Migration[5.2]
  def change
    create_table :entries do |t|
      t.string :meal_type
      t.integer :calories
      t.integer :proteins
      t.integer :carbohydrates
      t.integer :fats

      t.timestamps # created_at and updated_at
    end
  end
end
