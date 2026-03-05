const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
async function crearTablas() {

await pool.query(`
CREATE TABLE IF NOT EXISTS categorias (
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(100)
);
`);

await pool.query(`
CREATE TABLE IF NOT EXISTS productos (
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(150),
 categoria VARCHAR(100),
 precio_compra NUMERIC,
 tipo_margen VARCHAR(20),
 valor_margen NUMERIC,
 precio_venta NUMERIC,
 stock NUMERIC,
 imagen TEXT
);
`);

await pool.query(`
CREATE TABLE IF NOT EXISTS proveedores (
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(150),
 telefono VARCHAR(50)
);
`);

await pool.query(`
CREATE TABLE IF NOT EXISTS ventas (
 id SERIAL PRIMARY KEY,
 fecha DATE,
 total_usd NUMERIC,
 total_bs NUMERIC
);
`);

console.log("Tablas listas");
}

crearTablas();
app.get("/", (req, res) => {
  res.send("AVP POS BETA Activo");
});

app.get("/productos", async (req, res) => {
  const result = await pool.query("SELECT * FROM productos ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/productos", async (req, res) => {
  const { nombre, categoria, precio_compra, tipo_margen, valor_margen, stock } = req.body;

  let precio_venta;
  if (tipo_margen === "porcentaje") {
    precio_venta = precio_compra + (precio_compra * valor_margen / 100);
  } else {
    precio_venta = precio_compra + valor_margen;
  }

  await pool.query(
    "INSERT INTO productos(nombre,categoria,precio_compra,tipo_margen,valor_margen,precio_venta,stock) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [nombre, categoria, precio_compra, tipo_margen, valor_margen, precio_venta, stock]
  );

  res.json({ message: "Producto creado" });
});

app.listen(process.env.PORT || 10000, () => {
  console.log("Servidor iniciado");
});
