import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || !err.response) {
        setError('El servidor está iniciando, esto puede tardar unos segundos. Intenta de nuevo.');
      } else {
        setError(err.response?.data?.error || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Bienvenido de vuelta</h1>
        <p style={styles.subtitle}>Ingresa para ver tus tareas</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="tu@email.com"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={styles.footer}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={styles.link}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: '#ffffff',
    border: '1px solid #e6e1d4',
    borderRadius: '12px',
    padding: '40px 32px',
  },
  title: {
    fontSize: '26px',
    marginBottom: '6px',
  },
  subtitle: {
    color: '#8a8578',
    fontSize: '14px',
    marginBottom: '28px',
  },
  field: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '6px',
    color: '#1e2a22',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e6e1d4',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
  },
  error: {
    color: '#b0473a',
    fontSize: '13px',
    marginBottom: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3d6b52',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 500,
    marginTop: '4px',
  },
  footer: {
    marginTop: '24px',
    fontSize: '14px',
    color: '#8a8578',
    textAlign: 'center',
  },
  link: {
    color: '#3d6b52',
    fontWeight: 500,
    textDecoration: 'none',
  },
};

export default Login;