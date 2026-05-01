import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    assignedTo: '',
    dueDate: '',
  });
  const [taskError, setTaskError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);

      if (isAdmin) {
        const usersRes = await api.get('/users');
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    setSaving(true);
    try {
      const payload = { ...taskForm };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      const res = await api.post(`/projects/${id}/tasks`, payload);
      setTasks((prev) => [res.data, ...prev]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'todo', assignedTo: '', dueDate: '' });
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleUpdateTask = (updated) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  };

  const handleAddMember = async (userId) => {
    try {
      const res = await api.post(`/projects/${id}/members`, { userId });
      setProject(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const nonMembers = allUsers.filter(
    (u) => !project?.members.some((m) => m._id === u._id)
  );

  if (loading) return <p className="text-slate-500 text-sm">Loading project...</p>;
  if (error) return <p className="text-rose-400 text-sm">{error}</p>;
  if (!project) return null;

  const byStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="text-xs text-slate-500 hover:text-slate-300 mb-2 inline-block transition-colors"
          >
            ← Projects
          </button>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          {project.description && (
            <p className="text-slate-500 text-sm mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isAdmin && (
            <>
              <button onClick={() => setShowMemberModal(true)} className="btn-secondary text-sm">
                Manage Members
              </button>
              <button onClick={() => setShowTaskModal(true)} className="btn-primary text-sm">
                + Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* Members strip */}
      <div className="card mb-6">
        <p className="text-xs text-slate-500 font-medium mb-3">Team Members ({project.members.length})</p>
        <div className="flex flex-wrap gap-2">
          {project.members.length === 0 && (
            <p className="text-xs text-slate-600">No members yet</p>
          )}
          {project.members.map((m) => (
            <div
              key={m._id}
              className="flex items-center gap-2 bg-slate-800 rounded-full pl-1 pr-3 py-1"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-slate-300">{m.name}</span>
              <span className="text-xs text-slate-600 capitalize">({m.role})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { key: 'todo', label: 'To Do', color: 'text-slate-400' },
          { key: 'in-progress', label: 'In Progress', color: 'text-amber-400' },
          { key: 'completed', label: 'Completed', color: 'text-emerald-400' },
        ].map((col) => (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>
                {col.label}
              </h3>
              <span className="text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">
                {byStatus(col.key).length}
              </span>
            </div>
            <div className="space-y-3">
              {byStatus(col.key).length === 0 && (
                <p className="text-xs text-slate-700 py-4 text-center border border-dashed border-slate-800 rounded-lg">
                  No tasks
                </p>
              )}
              {byStatus(col.key).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={isAdmin ? handleDeleteTask : undefined}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <Modal title="Add Task" onClose={() => setShowTaskModal(false)}>
          {taskError && (
            <div className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {taskError}
            </div>
          )}
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
              <input
                type="text"
                className="input"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (optional)</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Task details..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                <select
                  className="input"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Assign To</label>
              <select
                className="input"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              >
                <option value="">Unassigned</option>
                {project.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creating...' : 'Create Task'}
              </button>
              <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Members Modal */}
      {showMemberModal && (
        <Modal title="Manage Members" onClose={() => setShowMemberModal(false)}>
          <div className="space-y-4">
            {/* Current members */}
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2">Current Members</p>
              {project.members.length === 0 && (
                <p className="text-xs text-slate-600">No members</p>
              )}
              <div className="space-y-2">
                {project.members.map((m) => (
                  <div key={m._id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm text-slate-200">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m._id)}
                      className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add members */}
            {nonMembers.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-2">Add Members</p>
                <div className="space-y-2">
                  {nonMembers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm text-slate-300">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <button
                        onClick={() => handleAddMember(u._id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
