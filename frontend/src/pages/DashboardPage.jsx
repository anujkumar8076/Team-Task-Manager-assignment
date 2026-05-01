import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const StatCard = ({ label, value, color }) => (
  <div className="card">
    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ tasks: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/tasks/my')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t._id === updated._id ? updated : t)),
    }));
  };

  const filteredTasks = data.tasks.filter((t) => {
    if (filter === 'overdue')
      return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed';
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const { stats } = data;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
          <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">Here's your task overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total ?? 0} color="text-slate-100" />
        <StatCard label="Completed" value={stats.completed ?? 0} color="text-emerald-400" />
        <StatCard label="In Progress" value={stats.inProgress ?? 0} color="text-amber-400" />
        <StatCard label="Overdue" value={stats.overdue ?? 0} color="text-rose-400" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'todo', 'in-progress', 'completed', 'overdue'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-600 text-sm">No tasks found</p>
          <Link to="/projects" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
            Browse projects →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <div key={task._id}>
              {task.project && (
                <p className="text-xs text-slate-600 mb-1.5 font-mono">
                  {task.project.name}
                </p>
              )}
              <TaskCard task={task} onUpdate={handleUpdate} isAdmin={user?.role === 'admin'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
