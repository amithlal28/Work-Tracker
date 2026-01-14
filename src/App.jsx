// Work Tracker - Dashboard and Entry Management
import React, { useState, useEffect, useMemo } from 'react';
import { Container, Navbar, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { Download, Trash2, LogOut, KeyRound, Upload } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { StorageService } from './services/storage';
import { WeeklyActivityChart, TaskDistributionChart } from './components/WorkCharts';
import { WorkEntryForm } from './components/WorkEntryForm';
import { WorkDashboard } from './components/WorkDashboard';
import { SortableItem } from './components/SortableItem';
import { ExportModal } from './components/ExportModal';
import { EditEntryModal } from './components/EditEntryModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [entries, setEntries] = useState([]);

  // Widget Order State
  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem('work_tracker_widgets');
      // Migration: If old layout key exists or format is different, use default
      return saved ? JSON.parse(saved) : ['chart-weekly', 'chart-task', 'entry-form', 'entries-list'];
    } catch {
      return ['chart-weekly', 'chart-task', 'entry-form', 'entries-list'];
    }
  });

  // Widget Sizes State (Column Widths: 1-12, Height: px)
  const [widgetSizes, setWidgetSizes] = useState(() => {
    try {
      const saved = localStorage.getItem('work_tracker_sizes');
      if (!saved) {
        return {
          'chart-weekly': { w: 7, h: 400 },
          'chart-task': { w: 5, h: 400 },
          'entry-form': { w: 4, h: 'auto' },
          'entries-list': { w: 8, h: 'auto' }
        };
      }

      const parsed = JSON.parse(saved);
      // Migration: Convert old scalar numbers to objects if needed
      const migrated = {};
      Object.keys(parsed).forEach(key => {
        if (typeof parsed[key] === 'number') {
          migrated[key] = { w: parsed[key], h: 400 }; // Default height for migration
        } else {
          migrated[key] = parsed[key];
        }
      });
      return migrated;
    } catch {
      return {
        'chart-weekly': { w: 7, h: 400 },
        'chart-task': { w: 5, h: 400 },
        'entry-form': { w: 4, h: 'auto' },
        'entries-list': { w: 8, h: 'auto' }
      };
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Fix: Require 8px movement before drag starts, allows clicking buttons/toggles
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('work_tracker_widgets', JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const handleResize = (id) => {
    setWidgetSizes(prev => {
      const current = prev[id] || { w: 6, h: 'auto' };
      const currentW = current.w;

      // Cycle sizes: 4 -> 6 -> 8 -> 12 -> 4
      let nextW = 6;
      if (currentW === 4) nextW = 6;
      else if (currentW === 6) nextW = 8;
      else if (currentW === 8) nextW = 12;
      else if (currentW === 12) nextW = 4;
      else nextW = 6;

      const newSizes = { ...prev, [id]: { ...current, w: nextW } };
      localStorage.setItem('work_tracker_sizes', JSON.stringify(newSizes));
      return newSizes;
    });
  };


  const renderWidget = (id) => {
    switch (id) {
      case 'chart-weekly':
        return <WeeklyActivityChart entries={entries} />;
      case 'chart-task':
        return <TaskDistributionChart entries={entries} />;
      case 'entry-form':
        return <WorkEntryForm onSave={handleAddEntry} />;
      case 'entries-list':
        return <WorkDashboard entries={entries} onDelete={handleDeleteEntry} onEdit={setEditingEntry} />;
      default:
        return null;
    }
  };

  // Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Clear Data Security
  const [deletePasskey, setDeletePasskey] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Initial Seeding
  useEffect(() => {
    StorageService.initSeeding();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser !== 'admin') {
      setEntries(StorageService.load(currentUser));
    }
  }, [currentUser]);

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEntries([]);
  };

  const handleAddEntry = (entry) => {
    if (!currentUser) return;
    StorageService.addEntry(currentUser, entry);
    setEntries(StorageService.load(currentUser));
  };

  const handleDeleteEntry = (id) => {
    if (!currentUser) return;
    if (confirm('Are you sure you want delete this entry?')) {
      StorageService.deleteEntry(currentUser, id);
      setEntries(StorageService.load(currentUser));
    }
  };

  const handleUpdateEntry = (updatedEntry) => {
    if (!currentUser) return;
    StorageService.updateEntry(currentUser, updatedEntry);
    setEntries(StorageService.load(currentUser));
    setEditingEntry(null);
  };

  const handleClearData = (e) => {
    e.preventDefault();
    setDeleteError('');

    // Verify passkey before deleting
    if (StorageService.verifyUser(currentUser, deletePasskey)) {
      StorageService.clear(currentUser);
      setEntries([]);
      setShowClearConfirm(false);
      setDeletePasskey('');
    } else {
      setDeleteError('Incorrect passkey.');
    }
  };

  const uniqueTasks = useMemo(() => {
    return [...new Set(entries.map(e => e.task))].sort();
  }, [entries]);

  const handleExport = (startDate, endDate, selectedTasks) => {
    if (!currentUser) return;
    StorageService.exportToExcel(currentUser, startDate, endDate, selectedTasks);
  };

  const handleExportJson = () => {
    if (!currentUser) return;
    StorageService.exportToJson(currentUser);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const count = await StorageService.importFromExcel(currentUser, file);
      setEntries(StorageService.load(currentUser));
      alert(`Successfully imported ${count} entries.`);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import data. Please check the file format.");
    }
    // Reset file input
    e.target.value = '';
  };

  // --- Render ---

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Admin View
  if (currentUser === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  // User View
  return (
    <div className="min-vh-100 d-flex flex-column fade-in">
      {/* Navbar */}
      <Navbar className="mb-4 pt-4 bg-transparent">
        <Container fluid="lg">
          <Navbar.Brand className="fw-bold fs-4 d-flex align-items-center text-dark">
            <span className="text-gradient fw-extrabold fs-3">Work Tracker</span>
            <span className="ms-3 badge-glass fw-normal small shadow-sm text-uppercase d-flex align-items-center gap-2">
              <span className="d-inline-block rounded-circle bg-success" style={{ width: 8, height: 8 }}></span>
              {currentUser}
            </span>
          </Navbar.Brand>
          <div className="d-flex gap-2">
            <div>
              <input
                type="file"
                accept=".xlsx, .xls"
                id="import-excel"
                style={{ display: 'none' }}
                onChange={handleImport}
              />
              <Button
                variant="white"
                className="text-secondary border-0 shadow-sm glass-card px-3"
                size="sm"
                onClick={() => document.getElementById('import-excel').click()}
                title="Import Excel"
              >
                <Upload size={18} />
              </Button>
            </div>
            <Button
              variant="white"
              className="text-secondary border-0 shadow-sm glass-card px-3"
              size="sm"
              onClick={() => setShowExportModal(true)}
              title="Export"
            >
              <Download size={18} />
            </Button>
            <Button
              variant="white"
              className="text-danger border-0 shadow-sm glass-card opacity-75 hover-opacity-100 px-3"
              size="sm"
              onClick={() => { setDeletePasskey(''); setDeleteError(''); setShowClearConfirm(true); }}
              title="Delete All"
            >
              <Trash2 size={18} />
            </Button>
            <Button
              variant="white"
              className="text-secondary border-0 shadow-sm glass-card ms-2 px-3"
              size="sm"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="flex-grow-1" fluid="lg">
        <div className="fade-in-up pb-5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgets}
              strategy={rectSortingStrategy}
            >
              <Row>
                {widgets.map((id) => (
                  <Col
                    key={id}
                    lg={widgetSizes[id]?.w || 6}
                    md={12}
                    className="mb-4"
                  >
                    <SortableItem
                      id={id}
                      height={widgetSizes[id]?.h}
                      onResize={() => handleResize(id)}
                    >
                      {renderWidget(id)}
                    </SortableItem>
                  </Col>
                ))}
              </Row>
            </SortableContext>
          </DndContext>
        </div>
      </Container >

      {/* Export Modal */}
      < ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)
        }
        onExport={handleExport}
        onExportJson={handleExportJson}
        availableTasks={uniqueTasks}
      />

      {/* Edit Entry Modal */}
      < EditEntryModal
        show={!!editingEntry}
        onHide={() => setEditingEntry(null)}
        entry={editingEntry}
        onSave={handleUpdateEntry}
      />

      {/* Secure Clear Data Modal */}
      < Modal show={showClearConfirm} onHide={() => setShowClearConfirm(false)} centered >
        <Modal.Header className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold text-danger">Clear User Space</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted small mb-4">
            This will permanently delete all your work logs. To confirm, please enter your <strong>passkey</strong>.
          </p>
          <Form onSubmit={handleClearData}>
            <Form.Group className="mb-3">
              <div className="position-relative">
                <KeyRound size={16} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
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
      </Modal >
    </div >
  );
}

export default App;
