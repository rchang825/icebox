-- Drop the database if it exists, then create it (run as a superuser)
DROP DATABASE IF EXISTS icebox;
CREATE DATABASE icebox;
\c icebox

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients table
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);
CREATE INDEX idx_ingredients_name ON ingredients(name);

-- Fridge Items table
CREATE TABLE fridge_items (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL REFERENCES ingredients(name) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit VARCHAR(32) NOT NULL DEFAULT 'unit',
  -- Tags: optional array of text labels for filtering/sorting (MVP)
  tags TEXT[] NOT NULL DEFAULT '{}',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_fridge_items_user_id ON fridge_items(user_id);

-- Grocery Items table
CREATE TABLE grocery_items (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL REFERENCES ingredients(name) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit VARCHAR(32) NOT NULL DEFAULT 'unit',
    checked BOOLEAN NOT NULL DEFAULT FALSE,
  -- Tags: optional array of text labels for filtering/sorting (MVP)
  tags TEXT[] NOT NULL DEFAULT '{}',
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_grocery_items_user_id ON grocery_items(user_id);

-- Meal Plans table
CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  time VARCHAR(32) NOT NULL,
  servings INTEGER DEFAULT 1,
  instructions TEXT[] NOT NULL,
  user_id INTEGER,
  ing_categories TEXT[]
);
CREATE INDEX idx_meals_user_id ON meals(user_id);

-- Meal Ingredients table
CREATE TABLE meal_ingredients (
  id SERIAL PRIMARY KEY,
  meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL REFERENCES ingredients(name) ON DELETE CASCADE,
  alias VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(32) NOT NULL DEFAULT 'unit'
);
CREATE INDEX idx_meal_ingredients_meal_id ON meal_ingredients(meal_id);
CREATE INDEX idx_meal_ingredients_category ON meal_ingredients(category);
