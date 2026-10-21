CREATE TABLE meal_menu_items (
    menu_item_id SERIAL PRIMARY KEY,

    meal_id INTEGER NOT NULL
        REFERENCES meals(meal_id)
        ON DELETE CASCADE,

    item_name VARCHAR(100) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (meal_id, item_name)
);