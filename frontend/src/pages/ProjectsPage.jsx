import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    api
      .get('/projects')
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/projects', form);
      setProjects((prev) => [res.data, ...prev]);
      setShowModal(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin ? 'Manage all projects' : 'Your assigned projects'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-600">No projects yet</p>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="text-indigo-400 text-sm hover:underline mt-2"
            >
              Create your first project →
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project._id} className="card hover:border-slate-700 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/projects/${project._id}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className="font-semibold text-slate-100 hover:text-indigo-400 transition-colors truncate">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all text-xs flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {project.members.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      title={m.name}
                      className="w-6 h-6 rounded-full bg-indigo-600/60 border border-slate-900 flex items-center justify-center text-xs text-white font-medium"
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <span className="text-xs text-slate-600">+{project.members.length - 4}</span>
                  )}
                </div>
                <Link
                  to={`/projects/${project._id}`}
                  className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          {error && (
            <div className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Project name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (optional)</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="What's this project about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
