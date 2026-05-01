import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['todo', 'in-progress', 'completed'];

const statusLabel = (s) =>
  s === 'todo' ? 'Todo' : s === 'in-progress' ? 'In Progress' : 'Completed';

const statusClass = (s) =>
  s === 'todo'
    ? 'badge-todo'
    : s === 'in-progress'
    ? 'badge-in-progress'
    : 'badge-completed';

export default function TaskCard({ task, onUpdate, onDelete, isAdmin }) {
  const { user } = useAuth();
  const [status, setStatus] = useState(task.status);
  const [updating, setUpdating] = useState(false);

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'completed';

  const canEdit =
    isAdmin ||
    (task.assignedTo && task.assignedTo._id === user?._id);

  const handleStatusChange = async (newStatus) => {
    if (!canEdit || newStatus === status) return;
    setUpdating(true);
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setStatus(res.data.status);
      onUpdate && onUpdate(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card hover:border-slate-700 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-100 truncate">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete && onDelete(task._id)}
            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all text-xs"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={statusClass(status)}>{statusLabel(status)}</span>
        {isOverdue && <span className="badge-overdue">Overdue</span>}
        {task.assignedTo && (
          <span className="text-xs text-slate-500 font-mono">
            @{task.assignedTo.name}
          </span>
        )}
        {task.dueDate && (
          <span className="text-xs text-slate-600 ml-auto">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {canEdit && (
        <div className="mt-3 flex gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              disabled={updating}
              onClick={() => handleStatusChange(s)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                status === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
