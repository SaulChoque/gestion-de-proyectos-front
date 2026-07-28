"use client";

import { useEffect, useState } from "react";

// 1. Definimos la interfaz basada en los campos de tu Base de Datos[cite: 1]
interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: "Baja" | "Media" | "Alta"; // RF2.2[cite: 1]
  estado: "Por hacer" | "En progreso" | "En revisión" | "Completada"; // RF2.3[cite: 1]
  fecha_vencimiento: string;
  responsable_id: number;
}

// Mapeo estético de columnas
const COLUMNAS: { id: Tarea["estado"]; titulo: string; color: string }[] = [
  { id: "Por hacer", titulo: "Por Hacer", color: "bg-gray-100 border-t-gray-400" },
  { id: "En progreso", titulo: "En Progreso", color: "bg-blue-50/50 border-t-blue-500" },
  { id: "En revisión", titulo: "En Revisión", color: "bg-amber-50/50 border-t-amber-500" },
  { id: "Completada", titulo: "Completada", color: "bg-emerald-50/50 border-t-emerald-500" },
];

export default function TableroKanban() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reemplaza esto con la URL real de tu backend en Render cuando esté desplegado
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // 2. Cargar tareas desde la API (GET /tareas/)
  useEffect(() => {
    async function cargarTareas() {
      try {
        const res = await fetch(`${API_URL}/tareas/`);
        if (!res.ok) throw new Error("Error al obtener las tareas del servidor");
        const data = await res.json();
        setTareas(data);
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : "Error desconocido";
        setError(mensaje);
        // Datos simulados (Mock) para que el equipo de front no se detenga si se cae el backend
        setTareas([
          { id: 1, titulo: "Diseñar componentes del Footer", descripcion: "Estructurar footer global", prioridad: "Baja", estado: "Por hacer", fecha_vencimiento: "2026-08-01", responsable_id: 3 },
          { id: 2, titulo: "Integración de pasarela de pagos Stripe", descripcion: "Implementar API de Stripe Checkout en el frontend", prioridad: "Alta", estado: "En progreso", fecha_vencimiento: "2026-07-30", responsable_id: 3 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    cargarTareas();
  }, [API_URL]);

  // 3. Cambiar estado de la tarea (PATCH /tareas/{id}/) al moverla en el Kanban[cite: 1]
  const cambiarEstadoTarea = async (id: number, nuevoEstado: Tarea["estado"]) => {
    // Actualización optimista en la interfaz
    const tareasPrevias = [...tareas];
    setTareas(tareas.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));

    try {
      const res = await fetch(`${API_URL}/tareas/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }), // Registra el cambio en la BD[cite: 1]
      });
      if (!res.ok) throw new Error();
    } catch {
      console.error("No se pudo actualizar el estado en el servidor remoto.");
      // Si falla, revertimos el cambio para evitar inconsistencias visuales
      setTareas(tareasPrevias);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tablero operativo...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Encabezado del Tablero */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tablero Kanban Ágil</h1>
          <p className="text-sm text-slate-500">Fase de ejecución del flujo operativo</p>
        </div>
        {error && (
          <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Modo offline (Usando datos locales simulados)
          </span>
        )}
      </div>

      {/* Grid del Kanban */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNAS.map((columna) => {
          const tareasFiltradas = tareas.filter(t => t.estado === columna.id);

          return (
            <div
              key={columna.id}
              className={`flex flex-col rounded-xl border-t-4 bg-slate-100/80 p-4 shadow-xs ${columna.color}`}
            >
              {/* Título de la Columna */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-700">{columna.titulo}</h2>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {tareasFiltradas.length}
                </span>
              </div>

              {/* Contenedor de Tarjetas */}
              <div className="flex flex-1 flex-col gap-3">
                {tareasFiltradas.map((tarea) => (
                  <div
                    key={tarea.id}
                    className="group rounded-lg border border-slate-200 bg-white p-4 shadow-xs transition-all hover:shadow-md cursor-pointer"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      {/* Badge de Prioridad (RF2.2)[cite: 1] */}
                      <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${
                        tarea.prioridad === "Alta" ? "bg-red-100 text-red-700" :
                        tarea.prioridad === "Media" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {tarea.prioridad}
                      </span>
                      
                      {/* Select rápido de movimiento temporal mientras integran Drag & Drop */}
                      <select
                        value={tarea.estado}
                        onChange={(e) => cambiarEstadoTarea(tarea.id, e.target.value as Tarea["estado"])}
                        className="rounded border border-slate-200 text-xs text-slate-500 bg-transparent p-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <option value="Por hacer">Mover a Por Hacer</option>
                        <option value="En progreso">Mover a En Progreso</option>
                        <option value="En revisión">Mover a En Revisión</option>
                        <option value="Completada">Mover a Completada</option>
                      </select>
                    </div>

                    <h3 className="font-medium text-slate-800 text-sm mb-1">{tarea.titulo}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{tarea.descripcion}</p>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                      <span>📅 {tarea.fecha_vencimiento}</span>
                      <span className="font-medium text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center">
                        U{tarea.responsable_id}
                      </span>
                    </div>
                  </div>
                ))}

                {tareasFiltradas.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400">
                    Sin tareas en esta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}