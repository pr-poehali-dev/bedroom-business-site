import json
import os
import psycopg2
import psycopg2.extras

SCHEMA = "t_p61490192_bedroom_business_sit"
ADMIN_PASSWORD = "somnium2024"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"], sslmode="disable")

def handler(event: dict, context) -> dict:
    """API для управления товарами магазина постельного белья."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, description, price, category, image_url, in_stock "
            "FROM " + SCHEMA + ".products ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        products = [
            {"id": r[0], "name": r[1], "description": r[2], "price": r[3],
             "category": r[4], "image_url": r[5], "in_stock": r[6]}
            for r in rows
        ]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"products": products}, ensure_ascii=False)}

    admin_pwd = headers.get("x-admin-password") or headers.get("X-Admin-Password", "")
    if admin_pwd != ADMIN_PASSWORD:
        return {"statusCode": 403, "headers": cors, "body": json.dumps({"error": "Неверный пароль"}, ensure_ascii=False)}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = body.get("name", "").strip()
        description = body.get("description", "").strip()
        price = int(body.get("price", 0))
        category = body.get("category", "").strip()
        image_url = body.get("image_url", "").strip() or None

        if not name or price <= 0:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Название и цена обязательны"}, ensure_ascii=False)}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO " + SCHEMA + ".products (name, description, price, category, image_url) "
            "VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (name, description, price, category, image_url)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 201, "headers": cors, "body": json.dumps({"id": new_id, "message": "Товар добавлен"}, ensure_ascii=False)}

    if method == "DELETE":
        params = event.get("queryStringParameters") or {}
        product_id = params.get("id")
        if not product_id:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "id обязателен"}, ensure_ascii=False)}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("DELETE FROM " + SCHEMA + ".products WHERE id = %s", (int(product_id),))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"message": "Товар удалён"}, ensure_ascii=False)}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "Method not allowed"}, ensure_ascii=False)}
