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

-- Fridge Items table
CREATE TABLE fridge_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(32) NOT NULL DEFAULT 'unit',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_fridge_items_user_id ON fridge_items(user_id);

-- Grocery Items table
CREATE TABLE grocery_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(32) NOT NULL DEFAULT 'unit',
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_grocery_items_user_id ON grocery_items(user_id);
