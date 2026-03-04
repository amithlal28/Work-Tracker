// Work Tracker - Main Application Component
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import {
  Download, Trash2, LogOut, KeyRound, Upload,
  BriefcaseIcon, Clock, Calendar, ListChecks, BarChart2, Moon, Sun
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { StorageService } from './services/storage';
import { WeeklyActivityChart, TaskDistributionChart } from './components/WorkCharts';
import { WorkEntryForm } from './components/WorkEntryForm';
import { WorkDashboard } from './components/WorkDashboard';
import { ExportModal } from './components/ExportModal';
import { EditEntryModal } from './components/EditEntryModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('work_tracker_theme') === 'dark';
  });

  // Apply dark mode to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('work_tracker_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletePasskey, setDeletePasskey] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { StorageService.initSeeding(); }, []);

  useEffect(() => {
    if (currentUser && currentUser !== 'admin') {
      StorageService.load(currentUser).then(setEntries);
    }
  }, [currentUser]);

  const handleLogin = (username) => setCurrentUser(username);
  const handleLogout = () => { setCurrentUser(null); setEntries([]); };

  const handleAddEntry = async (entry) => {
    if (!currentUser) return;
    await StorageService.addEntry(currentUser, entry);
    setEntries(await StorageService.load(currentUser));
  };

  const handleDeleteEntry = async (id) => {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      await StorageService.deleteEntry(currentUser, id);
      setEntries(await StorageService.load(currentUser));
    }
  };

  const handleUpdateEntry = async (updatedEntry) => {
    if (!currentUser) return;
    await StorageService.updateEntry(currentUser, updatedEntry);
    setEntries(await StorageService.load(currentUser));
    setEditingEntry(null);
  };

  const handleClearData = async (e) => {
    e.preventDefault();
    setDeleteError('');
    const valid = await StorageService.verifyUser(currentUser, deletePasskey);
    if (valid) {
      await StorageService.clear(currentUser);
      setEntries([]);
      setShowClearConfirm(false);
      setDeletePasskey('');
    } else {
      setDeleteError('Incorrect passkey.');
    }
  };

  const handleExport = async (startDate, endDate, selectedTasks) => {
    if (!currentUser) return;
    await StorageService.exportToExcel(currentUser, startDate, endDate, selectedTasks);
  };

  const handleExportJson = async () => {
    if (!currentUser) return;
    await StorageService.exportToJson(currentUser);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const count = await StorageService.importFromExcel(currentUser, file);
      setEntries(await StorageService.load(currentUser));
      alert(`Successfully imported ${count} entries.`);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import data. Please check the file format.");
    }
    e.target.value = '';
  };

  const uniqueTasks = useMemo(() => [...new Set(entries.map(e => e.task))].sort(), [entries]);

  const stats = useMemo(() => {
    const totalHours = entries.reduce((s, e) => s + (Number(e.hours) || 0), 0);
    const taskCount = new Set(entries.map(e => e.task)).size;
    const dates = [...new Set(entries.map(e => e.date))];
    const avgPerDay = dates.length > 0 ? (totalHours / dates.length) : 0;

    // This month
    const now = new Date();
    const monthEntries = entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthHours = monthEntries.reduce((s, e) => s + (Number(e.hours) || 0), 0);

    return { totalHours, taskCount, avgPerDay: avgPerDay.toFixed(1), monthHours };
  }, [entries]);

  // ─── Render ────────────────────────────────────────────────────
  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;
  if (currentUser === 'admin') return <AdminPanel onLogout={handleLogout} />;

  return (
    <div className="app-shell fade-in">
      {/* ── Topbar ── */}
      <header className="app-topbar">
        <div className="app-topbar-inner">
          {/* Brand */}
          <div className="brand">
            <div className="brand-icon">
              <BriefcaseIcon size={17} />
            </div>
            <span className="brand-name">Work Tracker</span>
          </div>

          {/* Center: user + total */}
          <div className="topbar-center">
            <div className="user-pill">
              <span className="user-dot" />
              {currentUser}
            </div>
            <div className="total-pill">
              <Clock size={13} />
              {stats.totalHours.toFixed(1)} hrs total
            </div>
          </div>

          {/* Actions */}
          <div className="topbar-actions">
            <input type="file" accept=".xlsx,.xls" id="import-excel" style={{ display: 'none' }} onChange={handleImport} />
            <button className="icon-btn topbar-btn-import" onClick={() => document.getElementById('import-excel').click()} title="Import Excel">
              <Upload size={16} />
            </button>
            <button className="icon-btn" onClick={() => setShowExportModal(true)} title="Export">
              <Download size={16} />
            </button>
            <button
              className="icon-btn danger"
              onClick={() => { setDeletePasskey(''); setDeleteError(''); setShowClearConfirm(true); }}
              title="Clear Data"
            >
              <Trash2 size={16} />
            </button>
            <div className="topbar-divider" style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }} />
            <button className="icon-btn" onClick={toggleTheme} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="icon-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="app-body fade-in-up">

        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff' }}>
              <Clock size={18} color="var(--primary)" />
            </div>
            <div className="stat-label">Total Hours</div>
            <div className="stat-value">{stats.totalHours.toFixed(1)}</div>
            <div className="stat-sub">across all tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4' }}>
              <Calendar size={18} color="var(--emerald)" />
            </div>
            <div className="stat-label">This Month</div>
            <div className="stat-value">{stats.monthHours.toFixed(1)}</div>
            <div className="stat-sub">hours logged</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fefce8' }}>
              <ListChecks size={18} color="var(--amber)" />
            </div>
            <div className="stat-label">Tasks</div>
            <div className="stat-value">{stats.taskCount}</div>
            <div className="stat-sub">unique projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fdf4ff' }}>
              <BarChart2 size={18} color="var(--purple)" />
            </div>
            <div className="stat-label">Avg / Day</div>
            <div className="stat-value">{stats.avgPerDay}</div>
            <div className="stat-sub">hours worked</div>
          </div>
        </div>

        {/* Entry Form */}
        <WorkEntryForm onSave={handleAddEntry} existingTasks={uniqueTasks} />

        {/* Charts Row */}
        <div className="charts-grid">
          <div className="chart-container-glass">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' }}>
              Weekly Activity
            </div>
            <WeeklyActivityChart entries={entries} />
          </div>
          <div className="chart-container-glass">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' }}>
              Task Breakdown
            </div>
            <TaskDistributionChart entries={entries} />
          </div>
        </div>

        {/* Work Log */}
        <WorkDashboard entries={entries} onDelete={handleDeleteEntry} onEdit={setEditingEntry} />
      </main>

      {/* ── Modals ── */}
      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        onExport={handleExport}
        onExportJson={handleExportJson}
        availableTasks={uniqueTasks}
      />

      <EditEntryModal
        show={!!editingEntry}
        onHide={() => setEditingEntry(null)}
        entry={editingEntry}
        onSave={handleUpdateEntry}
      />

      <Modal show={showClearConfirm} onHide={() => setShowClearConfirm(false)} centered>
        <Modal.Header className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold text-danger d-flex align-items-center gap-2">
            <Trash2 size={18} />
            Clear All Data
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted small mb-4">
            This will permanently delete all your work logs. Enter your <strong>passkey</strong> to confirm.
          </p>
          <Form onSubmit={handleClearData}>
            <Form.Group className="mb-3">
              <div className="position-relative">
                <KeyRound size={15} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                <Form.Control
                  type="password"
                  className="input-modern ps-5"
                  placeholder="Enter your passkey"
                  value={deletePasskey}
                  onChange={(e) => setDeletePasskey(e.target.value)}
                  autoFocus
                />
              </div>
            </Form.Group>
            {deleteError && <div className="text-danger small mb-3">{deleteError}</div>}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              <Button variant="danger" type="submit">Confirm Delete</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
