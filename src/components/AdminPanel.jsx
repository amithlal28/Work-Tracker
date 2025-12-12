import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form } from 'react-bootstrap';
import { ShieldAlert, RefreshCw, KeyRound, LogOut } from 'lucide-react';
import { StorageService } from '../services/storage';

export function AdminPanel({ onLogout }) {
    const [users, setUsers] = useState([]);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPasskey, setNewPasskey] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const userList = StorageService.getAllUsersList();
        setUsers(userList);
    };

    const openResetModal = (user) => {
        setSelectedUser(user);
        setNewPasskey('');
        setShowResetModal(true);
    };

    const handleResetPasskey = (e) => {
        e.preventDefault();
        if (selectedUser && newPasskey) {
            StorageService.resetUserPasskey(selectedUser.username, newPasskey);
            setShowResetModal(false);
            loadUsers(); // Refresh list (though passkeys are hidden, good practice)
            alert(`Passkey for ${selectedUser.username} has been reset.`);
        }
    };

    return (
        <div className="container py-5 fade-in" style={{ maxWidth: '800px' }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 className="fw-bold text-gradient d-flex align-items-center">
                    <ShieldAlert className="me-3" size={32} />
                    Superadmin Panel
                </h2>
                <Button variant="white" onClick={onLogout} className="shadow-sm">
                    <LogOut size={18} className="me-2" /> Logout
                </Button>
            </div>

            <Card className="card-glass border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-secondary small text-uppercase">Username</th>
                                <th className="py-3 text-secondary small text-uppercase">Status</th>
                                <th className="pe-4 py-3 text-end text-secondary small text-uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.username}>
                                    <td className="ps-4 fw-bold text-dark">{user.username}</td>
                                    <td>
                                        <span className="badge bg-success-subtle text-success rounded-pill fw-normal px-3">
                                            Active
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-primary text-decoration-none fw-bold"
                                            onClick={() => openResetModal(user)}
                                        >
                                            <RefreshCw size={14} className="me-1" /> Reset Passkey
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Reset Passkey Modal */}
            <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
                <Modal.Header className="border-0 pb-0">
                    <Modal.Title className="fs-5 fw-bold">Reset Passkey for {selectedUser?.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleResetPasskey}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-secondary fw-bold">NEW PASSKEY</Form.Label>
                            <div className="position-relative">
                                <KeyRound size={16} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                                <Form.Control
                                    type="text"
                                    className="input-modern ps-5"
                                    placeholder="Enter new passkey"
                                    value={newPasskey}
                                    onChange={(e) => setNewPasskey(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowResetModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit">Save New Passkey</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}
