// app/productos/route.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Listar todos los productos (GET)
export async function GET(req) {
  const productos = await prisma.producto.findMany();
  return new Response(JSON.stringify(productos), { status: 200 });
}

// Crear un nuevo producto (POST)
export async function POST(req) {
  const { nombre, codigo, precio } = await req.json();

  try {
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        codigo,
        precio: parseFloat(precio),
      },
    });
    return new Response(JSON.stringify(nuevoProducto), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al crear el producto' }), { status: 400 });
  }
}

// Actualizar un producto existente (PUT)
export async function PUT(req) {
  const { id, nombre, codigo, precio } = await req.json();

  try {
    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        codigo,
        precio: parseFloat(precio),
      },
    });
    return new Response(JSON.stringify(productoActualizado), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al actualizar el producto' }), { status: 400 });
  }
}
