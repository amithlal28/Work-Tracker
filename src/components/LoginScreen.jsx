import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { User, KeyRound, ArrowRight, ShieldAlert, ArrowLeft, BriefcaseIcon } from 'lucide-react';
import { StorageService } from '../services/storage';

export function LoginScreen({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [username, setUsername] = useState('');
    const [passkey, setPasskey] = useState('');
    const [adminPasscode, setAdminPasscode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isAdminMode) {
            if (adminPasscode === 'cosmos') {
                onLogin('admin');
            } else {
                setError('Invalid admin passcode');
            }
            setLoading(false);
            return;
        }

        if (!username.trim() || !passkey.trim()) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                await StorageService.createUser(username, passkey);
                onLogin(username);
            } else {
                const isValid = await StorageService.verifyUser(username, passkey);
                if (isValid) {
                    onLogin(username);
                } else {
                    setError('Invalid username or passkey');
                }
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const toggleAdminMode = () => {
        setIsAdminMode(!isAdminMode);
        setError('');
        setAdminPasscode('');
        setUsername('');
        setPasskey('');
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)', padding: '1.5rem'
        }}>
            <div className="fade-in-up" style={{
                width: '100%', maxWidth: 380,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, boxShadow: 'var(--shadow-xl)', padding: '2.5rem'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', boxShadow: '0 4px 12px var(--primary-ring)'
                    }}>
                        <BriefcaseIcon size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, letterSpacing: '-.02em' }}>
                        {isAdminMode ? 'Admin Access' : 'Work Tracker'}
                    </h1>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 4 }}>
                        {isAdminMode ? 'Restricted — authorized personnel only' : isSignUp ? 'Create your workspace' : 'Sign in to your workspace'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="fade-in" style={{
                        background: '#fff1f2', border: '1px solid #fecdd3', color: 'var(--rose)',
                        padding: '0.6rem 1rem', borderRadius: 8, fontSize: '0.85rem',
                        marginBottom: '1.25rem', fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {isAdminMode ? (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-field-label">Admin Passcode</label>
                            <div style={{ position: 'relative' }}>
                                <ShieldAlert size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--rose)' }} />
                                <input
                                    type="password"
                                    className="input-modern form-control"
                                    style={{ paddingLeft: '2.2rem !important' }}
                                    placeholder="Enter passcode"
                                    value={adminPasscode}
                                    onChange={(e) => setAdminPasscode(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-field-label">Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                                    <Form.Control
                                        type="text"
                                        className="input-modern"
                                        style={{ paddingLeft: '2.2rem' }}
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-field-label">Passkey</label>
                                <div style={{ position: 'relative' }}>
                                    <KeyRound size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                                    <Form.Control
                                        type="password"
                                        className="input-modern"
                                        style={{ paddingLeft: '2.2rem' }}
                                        placeholder={isSignUp ? 'Choose a passkey' : 'Enter your passkey'}
                                        value={passkey}
                                        onChange={(e) => setPasskey(e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', background: loading ? 'var(--border)' : 'var(--primary)',
                            color: 'white', border: 'none', borderRadius: 10, padding: '0.7rem',
                            fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all .15s', fontFamily: 'inherit', marginBottom: '1.25rem'
                        }}
                    >
                        {isAdminMode ? 'Enter Panel' : isSignUp ? 'Create Workspace' : 'Sign In'}
                        <ArrowRight size={16} />
                    </button>
                </form>

                {/* Footer */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    {!isAdminMode && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                            {isSignUp ? 'Already have a space?' : 'New here?'}{' '}
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                            >
                                {isSignUp ? 'Sign In' : 'Create Space'}
                            </button>
                        </div>
                    )}
                    <button
                        onClick={toggleAdminMode}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.78rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit'
                        }}
                    >
                        {isAdminMode ? <><ArrowLeft size={12} /> Back to User Login</> : <><ShieldAlert size={12} /> Admin Login</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
