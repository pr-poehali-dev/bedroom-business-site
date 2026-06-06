CREATE TABLE IF NOT EXISTS t_p61490192_bedroom_business_sit.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p61490192_bedroom_business_sit.products (name, description, price, category, image_url) VALUES
('Комплект «Белый туман»', 'Египетский хлопок 1000 нитей. Пододеяльник + 2 наволочки. Размер евро.', 18900, 'Комплекты', NULL),
('Подушка «Лебяжий пух»', 'Гипоаллергенный наполнитель. Высота 12 см. Средняя жёсткость.', 4500, 'Подушки', NULL),
('Одеяло «Cashmere»', 'Кашемировый наполнитель, летний вариант. 200×220 см.', 12000, 'Одеяла', NULL);
