import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PRIORITY_STYLES = {
  alta: { label: 'Alta', color: '#b0473a', bg: '#fbeae7' },
  media: { label: 'Media', color: '#c68a2e', bg: '#faf1e2' },
  baja: { label: 'Baja', color: '#3d6b52', bg: '#e9f1ec' },
};

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { logout } = useAuth();
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  async function loadTasks() {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  }
  
async function handleGenerateWithAI() {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setError('');

    try {
      const response = await api.post('/ai/generate-task', { prompt: aiPrompt });
      setTitle(response.data.title);
      setDescription(response.data.description);
      setAiPrompt('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar la tarea con IA');
    } finally {
      setAiLoading(false);
    }
  }
  async function handleCreateTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.post('/tasks', { title, description, priority, dueDate: dueDate || null });
      setTitle('');
      setDescription('');
      setPriority('media');
      setDueDate('');
      loadTasks();
      showToast('Tarea creada');
    } catch (err) {
      setError('Error al crear la tarea');
    }
  }

  async function handleToggleComplete(task) {
    try {
      await api.put(`/tasks/${task.id}`, { completed: !task.completed });
      loadTasks();
      showToast(task.completed ? 'Marcada como pendiente' : 'Tarea completada');
    } catch (err) {
      setError('Error al actualizar la tarea');
    }
  }

  function requestDelete(id) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    try {
      await api.delete(`/tasks/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      loadTasks();
      showToast('Tarea eliminada');
    } catch (err) {
      setError('Error al eliminar la tarea');
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'media',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id) {
    try {
      await api.put(`/tasks/${id}`, {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        dueDate: editForm.dueDate || null,
      });
      setEditingId(null);
      loadTasks();
      showToast('Tarea actualizada');
    } catch (err) {
      setError('Error al actualizar la tarea');
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  function formatDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  }

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '60px', color: '#8a8578' }}>Cargando...</p>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.banner}>
          <div>
            <h1 style={styles.bannerTitle}>Mis tareas</h1>
            <p style={styles.bannerSubtitle}>
              {pendingCount === 0 ? 'Todo al día 🌿' : `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={logout} style={styles.logoutButton} className="icon-button">
            Cerrar sesión
          </button>
        </div>

        <div style={styles.aiBox}>
          <p style={styles.aiLabel}>✨ Describe una idea y deja que la IA la convierta en tarea</p>
          <div style={styles.aiRow}>
            <input
              type="text"
              placeholder="Ej: preparar presentación para el cliente"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              style={styles.aiInput}
            />
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={!aiPrompt.trim() || aiLoading}
              className="primary-button"
              style={{
                ...styles.aiButton,
                opacity: aiPrompt.trim() && !aiLoading ? 1 : 0.5,
                cursor: aiPrompt.trim() && !aiLoading ? 'pointer' : 'not-allowed',
              }}
            >
              {aiLoading ? 'Generando...' : 'Generar con IA'}
            </button>
          </div>
        </div>

        <form onSubmit={handleCreateTask} style={styles.form}>
          <input
            type="text"
            placeholder="¿Qué necesitas hacer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...styles.input, marginTop: '10px' }}
          />
          <div style={styles.formRow}>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}>
              <option value="alta">Prioridad alta</option>
              <option value="media">Prioridad media</option>
              <option value="baja">Prioridad baja</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="primary-button"
            style={{
              ...styles.addButton,
              opacity: title.trim() ? 1 : 0.5,
              cursor: title.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Agregar tarea
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.filters}>
          {[
            { key: 'all', label: 'Todas' },
            { key: 'pending', label: 'Pendientes' },
            { key: 'completed', label: 'Completadas' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="filter-pill"
              style={{
                ...styles.filterPill,
                backgroundColor: filter === f.key ? '#3d6b52' : 'transparent',
                color: filter === f.key ? '#ffffff' : '#8a8578',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>{filter === 'all' ? 'Aún no tienes tareas' : 'Nada por aquí'}</p>
            <p style={styles.emptyText}>
              {filter === 'all' ? 'Agrega la primera arriba para empezar.' : 'Cambia el filtro para ver otras tareas.'}
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {filteredTasks.map((task) => {
              const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.media;
              const overdue = isOverdue(task);

              if (editingId === task.id) {
                return (
                  <div key={task.id} className="task-card" style={{ ...styles.card, borderLeftColor: p.color }}>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      style={{ ...styles.input, marginBottom: '8px' }}
                    />
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      style={{ ...styles.input, marginBottom: '8px' }}
                      placeholder="Descripción"
                    />
                    <div style={styles.formRow}>
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                        style={styles.select}
                      >
                        <option value="alta">Prioridad alta</option>
                        <option value="media">Prioridad media</option>
                        <option value="baja">Prioridad baja</option>
                      </select>
                      <input
                        type="date"
                        value={editForm.dueDate}
                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                        style={styles.dateInput}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button onClick={() => saveEdit(task.id)} className="primary-button" style={styles.saveButton}>
                        Guardar
                      </button>
                      <button onClick={cancelEdit} style={styles.cancelButton}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={task.id}
                  className="task-card"
                  style={{ ...styles.card, borderLeftColor: p.color, opacity: task.completed ? 0.6 : 1 }}
                >
                  <div style={styles.cardTop}>
                    <div style={styles.itemLeft}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        style={styles.checkbox}
                      />
                      <div>
                        <p
                          style={{
                            ...styles.taskTitle,
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </p>
                        {task.description && <p style={styles.taskDescription}>{task.description}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => startEdit(task)} className="icon-button" style={styles.iconBtn}>
                        Editar
                      </button>
                      <button
                        onClick={() => requestDelete(task.id)}
                        className="icon-button"
                        style={{ ...styles.iconBtn, color: '#b0473a' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div style={styles.badgeRow}>
                    <span style={{ ...styles.badge, color: p.color, backgroundColor: p.bg }}>{p.label}</span>
                    {task.dueDate && (
                      <span
                        style={{
                          ...styles.badge,
                          color: overdue ? '#b0473a' : '#8a8578',
                          backgroundColor: overdue ? '#fbeae7' : '#f4f1ea',
                        }}
                      >
                        {overdue ? '⚠ ' : ''}
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" style={styles.toast}>
          {toast}
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmDeleteId && (
        <div className="modal-overlay" style={styles.overlay}>
          <div style={styles.modal}>
            <p style={styles.modalTitle}>¿Eliminar esta tarea?</p>
            <p style={styles.modalText}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
              <button onClick={confirmDelete} style={styles.modalDeleteButton}>
                Eliminar
              </button>
              <button onClick={() => setConfirmDeleteId(null)} style={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', padding: '48px 20px' },
  container: { maxWidth: '600px', margin: '0 auto' },
  banner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: 'linear-gradient(135deg, #3d6b52, #2f5641)',
    borderRadius: '16px',
    padding: '28px 24px',
    marginBottom: '24px',
  },
  bannerTitle: { color: '#ffffff', fontSize: '28px' },
  bannerSubtitle: { color: '#d7e4dc', fontSize: '14px', marginTop: '4px' },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#ffffff',
    padding: '8px 14px',
    fontSize: '13px',
  },
  form: { backgroundColor: '#ffffff', border: '1px solid #e6e1d4', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  aiBox: { backgroundColor: '#f4f1ea', border: '1px dashed #3d6b52', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  aiLabel: { fontSize: '13px', fontWeight: 500, color: '#3d6b52', margin: '0 0 10px 0' },
  aiRow: { display: 'flex', gap: '8px' },
  aiInput: { flex: 1, padding: '10px 12px', border: '1px solid #e6e1d4', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' },
  aiButton: { padding: '10px 16px', backgroundColor: '#3d6b52', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e6e1d4', borderRadius: '8px', fontSize: '15px', outline: 'none' },
  formRow: { display: 'flex', gap: '10px', marginTop: '10px' },
  select: { flex: 1, padding: '10px 12px', border: '1px solid #e6e1d4', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff' },
  dateInput: { flex: 1, padding: '10px 12px', border: '1px solid #e6e1d4', borderRadius: '8px', fontSize: '14px' },
  addButton: { width: '100%', padding: '11px', backgroundColor: '#3d6b52', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: 500, marginTop: '14px' },
  error: { color: '#b0473a', fontSize: '13px', marginBottom: '14px' },
  filters: { display: 'flex', gap: '6px', marginBottom: '16px' },
  filterPill: { padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, border: '1px solid #e6e1d4' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e6e1d4', borderLeft: '4px solid', borderRadius: '10px', padding: '16px 18px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemLeft: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  checkbox: { marginTop: '4px', width: '18px', height: '18px', accentColor: '#3d6b52', cursor: 'pointer' },
  taskTitle: { margin: 0, fontSize: '15px', fontWeight: 500, color: '#1e2a22' },
  taskDescription: { margin: '4px 0 0 0', fontSize: '13px', color: '#8a8578' },
  iconBtn: { backgroundColor: 'transparent', color: '#8a8578', fontSize: '12px', padding: '6px 8px' },
  badgeRow: { display: 'flex', gap: '6px', marginTop: '12px', marginLeft: '30px' },
  badge: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' },
  saveButton: { padding: '8px 16px', backgroundColor: '#3d6b52', color: '#ffffff', borderRadius: '8px', fontSize: '13px' },
  cancelButton: { padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #e6e1d4', color: '#1e2a22', borderRadius: '8px', fontSize: '13px' },
  emptyState: { textAlign: 'center', padding: '48px 20px', backgroundColor: '#ffffff', border: '1px dashed #e6e1d4', borderRadius: '12px' },
  emptyTitle: { fontFamily: "'Fraunces', serif", fontSize: '18px', marginBottom: '6px' },
  emptyText: { color: '#8a8578', fontSize: '14px', margin: 0 },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#1e2a22',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30,42,34,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '340px',
    width: '100%',
  },
  modalTitle: { fontFamily: "'Fraunces', serif", fontSize: '18px', margin: 0 },
  modalText: { color: '#8a8578', fontSize: '14px', marginTop: '6px' },
  modalDeleteButton: { padding: '8px 16px', backgroundColor: '#b0473a', color: '#ffffff', borderRadius: '8px', fontSize: '13px' },
};

export default Dashboard;