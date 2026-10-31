// Todos los problemas publicados, para el entrenador. Se genera en cada compilación junto con la página.
import type { APIRoute } from 'astro';
import { calendarioProblemas } from '../../../lib/datos';

export const GET: APIRoute = async () => {
  const { publicados } = await calendarioProblemas();
  // La fecha de publicación no hace falta en el navegador.
  return new Response(JSON.stringify(publicados.map(({ fechaPublicacion, ...p }) => p)), {
    headers: { 'Content-Type': 'application/json' },
  });
};
