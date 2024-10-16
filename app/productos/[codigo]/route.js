import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { codigo } = params;

  const producto = await prisma.producto.findUnique({
    where: { codigo: codigo }
  });

  if (producto) {
    return new Response(JSON.stringify(producto), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: 'Producto no encontrado' }), { status: 404 });
  }
}
