"use client";

import { KanbanBoard } from "@/features/tasks-board";

export default function TableroPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Operational Kanban Board
          </h1>
          <p className="text-sm text-slate-500">
            Drag tasks between columns or use the dropdown to change status
          </p>
        </div>
      </div>
      <KanbanBoard />
    </div>
  );
}
