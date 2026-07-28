// services/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Función auxiliar para manejar las peticiones HTTP y errores de forma unificada
async function clientFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Aquí es donde tu compañero configurará la lógica para adjuntar el Token JWT de Supabase Auth en el futuro
  const headers = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error en la petición: ${response.status}`);
  }

  // Si la respuesta es un 204 No Content (como en un DELETE), no intentamos parsear JSON
  if (response.status === 204) return {} as T;

  return response.json();
}

// Objeto con los métodos HTTP listos para usar en tus características
export const api = {
  get: <T>(endpoint: string) => clientFetch<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, data: unknown) => 
    clientFetch<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  
  patch: <T>(endpoint: string, data: unknown) => 
    clientFetch<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  
  delete: <T>(endpoint: string) => clientFetch<T>(endpoint, { method: "DELETE" }),
};