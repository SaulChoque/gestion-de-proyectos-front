"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api"; // Importamos tu cliente API recién corregido

// Estructura de la tarea basada exactamente en el modelo de la Base de Datos
interface Tarea {
  id: number;
  proyecto_id: number;
  titulo: string;
  descripcion: string;
  responsable_id: number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  prioridad: "Baja" | "Media" | "Alta";
  estado: "Por hacer" | "En progreso" | "En revisión" | "Completada";
}

// Configuración visual de las columnas del Kanban
const COLUMNAS: { id: Tarea["estado"]; titulo: string; color: string }[] = [
  { id: "Por hacer", titulo: "Por Hacer", color: "bg-slate-100 border-t-slate-400" },
  { id: "En progreso", titulo: "En Progreso", color: "bg-blue-50/50 border-t-blue-500" },
  { id: "En revisión", titulo: "En Revisión", color: "bg-amber-50/50 border-t-amber-500" },
  { id: "Completada", titulo: "Completada", color: "bg-emerald-50/50 border-t-emerald-500" },
];

export default function TableroKanban() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. PETICIÓN GET: Traer las tareas desde Django al cargar la pantalla
  useEffect(() => {
    async function cargarTablero() {
      try {
        setLoading(true);
        // Consumimos el endpoint /tareas/ que configuró tu compañero
        const data = await api.get<Tarea[]>("/tareas/");
        setTareas(data);
      } catch (err) {
        const mensajeError = err instanceof Error ? err.message : "Error al conectar con Render";
        setError(mensajeError);
        console.error("Detalle del fallo:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarTablero();
  }, []);

  // 2. PETICIÓN PATCH: Actualizar el estado en la base de datos al mover una tarea
  const cambiarEstadoTarea = async (tareaId: number, nuevoEstado: Tarea["estado"]) => {
    // Guardamos el estado anterior por si la petición a internet falla (Optimistic UI)
    const respaldoTareas = [...tareas];
    
    // Actualizamos la interfaz de inmediato para que el usuario no sienta lag
    setTareas(tareas.map(t => t.id === tareaId ? { ...t, estado: nuevoEstado } : t));

    try {
      // Enviamos el cambio parcial a Django usando tu cliente corregido
      await api.patch<Tarea>(`/tareas/${tareaId}/`, { estado: nuevoEstado });
    } catch (err) {
      console.error("No se pudo guardar el cambio en Render, revirtiendo...", err);
      alert("Error de conexión: El estado no se guardó en el servidor.");
      // Si falló, regresamos las tareas a su posición original
      setTareas(respaldoTareas);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm text-slate-500 font-medium">Cargando flujo operativo desde Render...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Encabezado dinámico */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tablero Kanban Operativo</h1>
          <p className="text-sm text-slate-500">Sincronizado en tiempo real con Django & Supabase</p>
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-700 max-w-md">
            <strong>Fallo de conexión:</strong> {error}
          </div>
        )}
      </div>

      {/* Grid del Tablero */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNAS.map((columna) => {
          const tareasDeEstaColumna = tareas.filter(t => t.estado === columna.id);

          return (
            <div 
              key={columna.id} 
              className={`flex flex-col rounded-xl border-t-4 bg-slate-100/70 p-4 shadow-xs min-h-[400px] ${columna.color}`}
            >
              {/* Título de Columna */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-700 text-sm">{columna.titulo}</h2>
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-bold text-slate-600">
                  {tareasDeEstaColumna.length}
                </span>
              </div>

              {/* Contenedor de Tarjetas */}
              <div className="flex flex-1 flex-col gap-3">
                {tareasDeEstaColumna.map((tarea) => (
                  <div 
                    key={tarea.id} 
                    className="group rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    {/* Tags superiores */}
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        tarea.prioridad === "Alta" ? "bg-red-50 text-red-700 border border-red-100" :
                        tarea.prioridad === "Media" ? "bg-amber-50 text-amber-700 border border-amber-100" : 
                        "bg-slate-50 text-slate-600 border border-slate-100"
                      }`}>
                        {tarea.prioridad}
                      </span>
                      
                      {/* Selector de cambio de estado rápido */}
                      <select
                        value={tarea.estado}
                        onChange={(e) => cambiarEstadoTarea(tarea.id, e.target.value as Tarea["estado"])}
                        className="rounded border border-slate-200 text-xs text-slate-500 p-1 bg-slate-50 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity focus:outline-hidden"
                      >
                        <option value="Por hacer">Mover a: Por Hacer</option>
                        <option value="En progreso">Mover a: En Progreso</option>
                        <option value="En revisión">Mover a: En Revisión</option>
                        <option value="Completada">Mover a: Completada</option>
                      </select>
                    </div>

                    {/* Contenido de la Tarea */}
                    <h3 className="font-semibold text-slate-800 text-sm mb-1 leading-snug">
                      {tarea.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {tarea.descripcion}
                    </p>

                    {/* Metadatos inferiores */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        📅 {tarea.fecha_vencimiento}
                      </span>
                      <span className="font-medium text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px]" title={`Responsable ID: ${tarea.responsable_id}`}>
                        U{tarea.responsable_id}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Vista vacía de columna */}
                {tareasDeEstaColumna.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300/80 py-8 text-center text-xs text-slate-400 font-normal bg-slate-50/50">
                    Sin tareas pendientes aquí
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