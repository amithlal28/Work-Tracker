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

    const loadUsers = async () => {
        const userList = await StorageService.getAllUsersList();
        setUsers(userList);
    };

    const openResetModal = (user) => {
        setSelectedUser(user);
        setNewPasskey('');
        setShowResetModal(true);
    };

    const handleResetPasskey = async (e) => {
        e.preventDefault();
        if (selectedUser && newPasskey) {
            await StorageService.resetUserPasskey(selectedUser.username, newPasskey);
            setShowResetModal(false);
            loadUsers();
            alert(`Passkey for ${selectedUser.username} has been reset.`);
        }
    };

    return (
        <div className="admin-shell fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', margin: 0 }}>
                    <ShieldAlert style={{ marginRight: '0.75rem' }} size={28} />
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
