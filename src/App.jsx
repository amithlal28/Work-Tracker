import React, { useState, useEffect } from 'react';
import { Container, Navbar, Button, Modal, Form } from 'react-bootstrap';
import { Download, Trash2, LogOut, KeyRound } from 'lucide-react';
import { StorageService } from './services/storage';
import { WorkEntryForm } from './components/WorkEntryForm';
import { WorkDashboard } from './components/WorkDashboard';
import { ExportModal } from './components/ExportModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [entries, setEntries] = useState([]);

  // Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleExport = (startDate, endDate) => {
    if (!currentUser) return;
    StorageService.exportToExcel(currentUser, startDate, endDate);
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
      <Navbar className="mb-5 pt-4 bg-transparent">
        <Container style={{ maxWidth: '800px' }}>
          <Navbar.Brand className="fw-bold fs-4 d-flex align-items-center text-dark">
            <span className="text-gradient">Work Tracker</span>
            <span className="ms-2 badge bg-light text-secondary fw-normal small shadow-sm">{currentUser}</span>
          </Navbar.Brand>
          <div className="d-flex gap-2">
            <Button
              variant="white"
              className="text-secondary border-0 shadow-sm"
              size="sm"
              onClick={() => setShowExportModal(true)}
              title="Export"
            >
              <Download size={18} />
            </Button>
            <Button
              variant="white"
              className="text-danger border-0 shadow-sm opacity-50 hover-opacity-100"
              size="sm"
              onClick={() => { setDeletePasskey(''); setDeleteError(''); setShowClearConfirm(true); }}
              title="Delete All"
            >
              <Trash2 size={18} />
            </Button>
            <Button
              variant="white"
              className="text-secondary border-0 shadow-sm ms-2"
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
      <Container className="flex-grow-1" style={{ maxWidth: '800px' }}>
        <div className="fade-in-up">
          <WorkEntryForm onSave={handleAddEntry} />
          <div className="my-5">
            <WorkDashboard entries={entries} onDelete={handleDeleteEntry} />
          </div>
        </div>
      </Container>

      {/* Export Modal */}
      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      {/* Secure Clear Data Modal */}
      <Modal show={showClearConfirm} onHide={() => setShowClearConfirm(false)} centered>
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
      </Modal>
    </div>
  );
}

export default App;
