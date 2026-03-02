import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Search } from 'lucide-react';

export function WorkEntryForm({ onSave, existingTasks = [] }) {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({ date: today, task: '', hours: '', details: '' });
    const [taskInput, setTaskInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [saving, setSaving] = useState(false);
    const taskRef = useRef(null);

    // Show all tasks when nothing typed, filter when user types
    const filtered = taskInput.length === 0
        ? existingTasks
        : existingTasks.filter(t => t.toLowerCase().includes(taskInput.toLowerCase()));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTaskInput = (e) => {
        setTaskInput(e.target.value);
        setFormData(prev => ({ ...prev, task: e.target.value }));
        setShowSuggestions(true);
    };

    const selectTask = (task) => {
        setTaskInput(task);
        setFormData(prev => ({ ...prev, task }));
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.task || !formData.hours) return;
        setSaving(true);
        await onSave({ ...formData, hours: parseFloat(formData.hours) || 0 });
        setSaving(false);
        setFormData(prev => ({ ...prev, task: '', hours: '', details: '' }));
        setTaskInput('');
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => { if (!taskRef.current?.contains(e.target)) setShowSuggestions(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="panel mb-4">
            <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={16} color="var(--primary)" />
                    </div>
                    <span className="panel-title">Log Work</span>
                </div>
            </div>
            <div className="panel-body">
                <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 100px', gap: '0.75rem', alignItems: 'end' }}>
                    {/* Date */}
                    <div>
                        <label className="form-field-label">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="input-modern form-control"
                        />
                    </div>

                    {/* Task with full list + search dropdown */}
                    <div ref={taskRef} style={{ position: 'relative' }}>
                        <label className="form-field-label">Task / Project</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Select or type a task..."
                                value={taskInput}
                                onChange={handleTaskInput}
                                onFocus={() => setShowSuggestions(true)}
                                required
                                className="input-modern form-control"
                                style={{ paddingRight: '2rem' }}
                            />
                            <Search size={14} style={{
                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-3)', pointerEvents: 'none'
                            }} />
                        </div>

                        {showSuggestions && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 300,
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                borderRadius: 10, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
                                maxHeight: 260, overflowY: 'auto'
                            }}>
                                {filtered.length === 0 ? (
                                    <div style={{ padding: '10px 14px', fontSize: '0.84rem', color: 'var(--text-3)' }}>
                                        Press Enter to create "{taskInput}"
                                    </div>
                                ) : (
                                    filtered.map((task, i) => (
                                        <div
                                            key={i}
                                            onMouseDown={() => selectTask(task)}
                                            style={{
                                                padding: '9px 14px', cursor: 'pointer', fontSize: '0.875rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                transition: 'background .1s', color: 'var(--text-1)',
                                                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span>{task}</span>
                                            {formData.task === task && <Check size={13} color="var(--primary)" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Hours */}
                    <div>
                        <label className="form-field-label">Hours</label>
                        <input
                            type="number"
                            step="0.25"
                            name="hours"
                            min="0"
                            placeholder="0.0"
                            value={formData.hours}
                            onChange={handleChange}
                            required
                            className="input-modern form-control"
                        />
                    </div>
                </div>

                {/* Details */}
                <div style={{ marginTop: '0.75rem' }}>
                    <label className="form-field-label">
                        Details <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optional)</span>
                    </label>
                    <textarea
                        name="details"
                        rows={2}
                        placeholder="Brief description of what was done..."
                        value={formData.details}
                        onChange={handleChange}
                        className="input-modern form-control"
                        style={{ resize: 'none' }}
                        onKeyDown={(e) => { if (e.key === ' ') e.stopPropagation(); }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.875rem' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            background: saving ? 'var(--border)' : 'var(--primary)',
                            color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem',
                            fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6,
                            cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .15s', fontFamily: 'inherit'
                        }}
                    >
                        <Plus size={16} />
                        {saving ? 'Saving...' : 'Add Entry'}
                    </button>
                </div>
            </div>
        </form>
    );
}
