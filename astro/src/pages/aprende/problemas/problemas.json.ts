// Todos los problemas publicados, para el entrenador. Se genera en cada compilación junto con la página.
import type { APIRoute } from 'astro';
import { calendarioProblemas } from '../../../lib/datos';
import { paraLaWeb } from '../../../lib/problemas/validar';

export const GET: APIRoute = async () => {
  const { publicados } = await calendarioProblemas();
  return new Response(JSON.stringify(publicados.map(paraLaWeb)), {
    headers: { 'Content-Type': 'application/json' },
  });
};
