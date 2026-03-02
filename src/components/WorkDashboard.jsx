import React, { useMemo } from 'react';
import { Accordion } from 'react-bootstrap';
import { Trash2, Pencil, Clock } from 'lucide-react';

export function WorkDashboard({ entries, onDelete, onEdit }) {
    const groupedEntries = useMemo(() => {
        const groups = {};
        entries.forEach(entry => {
            const date = entry.date;
            if (!groups[date]) groups[date] = [];
            groups[date].push(entry);
        });
        return Object.entries(groups)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([date, items]) => ({
                date,
                items,
                totalHours: items.reduce((sum, item) => sum + (Number(item.hours) || 0), 0)
            }));
    }, [entries]);

    if (entries.length === 0) {
        return (
            <div className="panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-3)' }}>
                <Clock size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-2)' }}>No work logged yet</div>
                <div style={{ fontSize: '0.85rem', marginTop: 4 }}>Use the form above to log your first entry.</div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Work Log — {entries.length} entries
                </div>
            </div>

            <Accordion defaultActiveKey={groupedEntries.length > 0 ? groupedEntries[0].date : null} alwaysOpen>
                {groupedEntries.map((group) => (
                    <Accordion.Item eventKey={group.date} key={group.date}>
                        <Accordion.Header>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                    {new Date(group.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{group.items.length} entr{group.items.length === 1 ? 'y' : 'ies'}</span>
                                    <span className="hours-badge">
                                        {group.totalHours % 1 === 0 ? group.totalHours : group.totalHours.toFixed(1)} hrs
                                    </span>
                                </div>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body>
                            <table className="table-glass" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '28%' }}>Task</th>
                                        <th style={{ width: '48%' }}>Details</th>
                                        <th style={{ width: '10%', textAlign: 'center' }}>Hours</th>
                                        <th style={{ width: '14%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.items.map((entry) => (
                                        <tr key={entry.id} style={{ transition: 'background .15s' }}>
                                            <td>
                                                <span style={{ fontWeight: 500, color: 'var(--text-1)', fontSize: '0.875rem' }}>{entry.task}</span>
                                            </td>
                                            <td>
                                                <span style={{ color: 'var(--text-2)', fontSize: '0.845rem', lineHeight: 1.5 }}>{entry.details}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                                                    {Number(entry.hours) % 1 === 0 ? entry.hours : Number(entry.hours).toFixed(2)}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                    <button
                                                        onClick={() => onEdit(entry)}
                                                        title="Edit"
                                                        style={{
                                                            background: 'none', border: 'none', cursor: 'pointer', padding: '5px 7px',
                                                            borderRadius: 6, color: 'var(--text-3)', transition: 'all .15s'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(entry.id)}
                                                        title="Delete"
                                                        style={{
                                                            background: 'none', border: 'none', cursor: 'pointer', padding: '5px 7px',
                                                            borderRadius: 6, color: 'var(--text-3)', transition: 'all .15s'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = 'var(--rose)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </div>
    );
}
