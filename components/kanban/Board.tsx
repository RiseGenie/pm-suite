'use client';

import { useEffect, useState, useTransition } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import Link from 'next/link';
import type { Task, TaskStatus } from '@/lib/types';
import { updateTaskStatus, createTask } from '@/app/dashboard/projects/[id]/actions';
import { SubmitButton } from '@/components/SubmitButton';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'in_review', label: 'In review' },
  { key: 'done', label: 'Done' },
];

const PRIORITY_COLOR: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

type TaskWithAssignee = Task & { assignee?: { full_name: string | null } | null };

function TaskCard({ task, projectId }: { task: TaskWithAssignee; projectId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`card p-3 mb-2 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      <Link href={`/dashboard/projects/${projectId}?task=${task.id}`} className="block">
        <p className="text-sm font-medium">{task.title}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`badge ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
          {task.due_date && <span className="text-xs text-muted">{task.due_date}</span>}
        </div>
        {task.assignee?.full_name && (
          <p className="text-xs text-muted mt-1">{task.assignee.full_name}</p>
        )}
      </Link>
    </div>
  );
}

function Column({
  status,
  label,
  tasks,
  projectId,
}: {
  status: TaskStatus;
  label: string;
  tasks: TaskWithAssignee[];
  projectId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [showForm, setShowForm] = useState(false);
  const createForStatus = createTask.bind(null, projectId, status);

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 rounded-theme p-3 ${isOver ? 'bg-primary/5' : ''}`}
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">
          {label} <span className="text-muted font-normal">({tasks.length})</span>
        </h3>
      </div>

      {tasks
        .sort((a, b) => a.position - b.position)
        .map((t) => (
          <TaskCard key={t.id} task={t} projectId={projectId} />
        ))}

      {showForm ? (
        <form
          action={async (fd) => {
            await createForStatus(fd);
            setShowForm(false);
          }}
          className="mt-2"
        >
          <input name="title" autoFocus placeholder="Task title" className="input text-xs" />
          <div className="flex gap-2 mt-2">
            <SubmitButton className="btn btn-primary text-xs" pendingText="Adding…">
              Add
            </SubmitButton>
            <button type="button" className="btn btn-secondary text-xs" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-muted hover:text-primary w-full text-left px-1 py-1"
        >
          + Add task
        </button>
      )}
    </div>
  );
}

export function Board({ tasks, projectId }: { tasks: TaskWithAssignee[]; projectId: string }) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const destTasks = localTasks.filter((t) => t.status === newStatus);
    const newPosition = destTasks.length;

    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t))
    );
    startTransition(() => {
      updateTaskStatus(taskId, projectId, newStatus, newPosition);
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.key}
            status={col.key}
            label={col.label}
            tasks={localTasks.filter((t) => t.status === col.key)}
            projectId={projectId}
          />
        ))}
      </div>
    </DndContext>
  );
}
