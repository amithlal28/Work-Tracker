import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { User, KeyRound, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import { StorageService } from '../services/storage';

export function LoginScreen({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);

    const [username, setUsername] = useState('');
    const [passkey, setPasskey] = useState('');
    const [adminPasscode, setAdminPasscode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (isAdminMode) {
            if (adminPasscode === 'cosmos') {
                onLogin('admin');
            } else {
                setError('Invalid admin passcode');
            }
            return;
        }

        if (!username.trim() || !passkey.trim()) {
            setError('Please fill in all fields');
            return;
        }

        try {
            if (isSignUp) {
                StorageService.createUser(username, passkey);
                onLogin(username);
            } else {
                const isValid = StorageService.verifyUser(username, passkey);
                if (isValid) {
                    onLogin(username);
                } else {
                    setError('Invalid username or passkey');
                }
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleAdminMode = () => {
        setIsAdminMode(!isAdminMode);
        setError('');
        setAdminPasscode('');
        setUsername('');
        setPasskey('');
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 fade-in px-3">
            <Card className="card-glass border-0" style={{ width: '100%', maxWidth: '400px', borderRadius: '1.5rem' }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold mb-1 text-gradient">
                            {isAdminMode ? 'SuperAdmin Access' : 'Work Tracker'}
                        </h2>
                        <p className="text-muted small">
                            {isAdminMode ? 'Restricted Area' : 'Your personal productivity space'}
                        </p>
                    </div>

                    {error && <Alert variant="danger" className="py-2 small border-0 mb-4 fade-in">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {isAdminMode ? (
                            // Admin Mode
                            <Form.Group className="mb-5 fade-in">
                                <Form.Label className="small fw-bold text-uppercase text-secondary letter-spacing-1">Admin Passcode</Form.Label>
                                <div className="position-relative">
                                    <ShieldAlert size={18} className="position-absolute ms-3 top-50 translate-middle-y text-danger" />
                                    <Form.Control
                                        type="password"
                                        className="input-modern ps-5"
                                        placeholder="Enter Password"
                                        value={adminPasscode}
                                        onChange={(e) => setAdminPasscode(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </Form.Group>
                        ) : (
                            // User Mode
                            <>
                                <Form.Group className="mb-4 fade-in">
                                    <Form.Label className="small fw-bold text-uppercase text-secondary letter-spacing-1">Username</Form.Label>
                                    <div className="position-relative">
                                        <User size={18} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                                        <Form.Control
                                            type="text"
                                            className="input-modern ps-5"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-5 fade-in">
                                    <Form.Label className="small fw-bold text-uppercase text-secondary letter-spacing-1">User Passkey</Form.Label>
                                    <div className="position-relative">
                                        <KeyRound size={18} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                                        <Form.Control
                                            type="password"
                                            className="input-modern ps-5"
                                            placeholder="Create or enter passkey"
                                            value={passkey}
                                            onChange={(e) => setPasskey(e.target.value)}
                                        />
                                    </div>
                                </Form.Group>
                            </>
                        )}

                        <Button type="submit" className="w-100 btn-modern py-3 d-flex align-items-center justify-content-center mb-3">
                            {isAdminMode ? 'Unlock Panel' : (isSignUp ? 'Create Account' : 'Sign In')}
                            <ArrowRight size={18} className="ms-2" />
                        </Button>
                    </Form>

                    {/* Footer Controls */}
                    <div className="d-flex flex-column align-items-center mt-4 gap-2">
                        {!isAdminMode && (
                            <div>
                                <span className="text-muted small me-2">{isSignUp ? 'Already have an space?' : 'New here?'}</span>
                                <button
                                    className="btn btn-link p-0 text-decoration-none fw-bold"
                                    style={{ color: 'var(--primary-color)' }}
                                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                >
                                    {isSignUp ? 'Log In' : 'Create Space'}
                                </button>
                            </div>
                        )}

                        <button
                            className="btn btn-link p-0 text-decoration-none small text-secondary opacity-75 hover-opacity-100 mt-2"
                            onClick={toggleAdminMode}
                        >
                            {isAdminMode ? (
                                <><ArrowLeft size={14} className="me-1" /> Back to User Login</>
                            ) : (
                                <><ShieldAlert size={14} className="me-1" /> SuperAdmin Login</>
                            )}
                        </button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}
