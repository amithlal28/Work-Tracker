import React, { useMemo } from 'react';
import { Table, Button, Accordion } from 'react-bootstrap';
import { Trash2, Pencil } from 'lucide-react';

export function WorkDashboard({ entries, onDelete, onEdit }) {
    // Group entries by Date (descending)
    const groupedEntries = useMemo(() => {
        const groups = {};
        entries.forEach(entry => {
            const date = entry.date;
            if (!groups[date]) groups[date] = [];
            groups[date].push(entry);
        });

        return Object.entries(groups)
            .sort((a, b) => new Date(b[0]) - new Date(a[0])) // Sort by date descending
            .map(([date, items]) => ({
                date,
                items,
                totalHours: items.reduce((sum, item) => sum + (item.hours || 0), 0)
            }));
    }, [entries]);

    const grandTotal = useMemo(() => {
        return entries.reduce((sum, item) => sum + (item.hours || 0), 0);
    }, [entries]);

    if (entries.length === 0) {
        return (
            <div className="text-center py-5">
                <p className="text-muted fw-light">No work logged yet.</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <Accordion defaultActiveKey={groupedEntries.length > 0 ? groupedEntries[0].date : null} alwaysOpen className="accordion-glass border-0">
                {groupedEntries.map((group) => (
                    <Accordion.Item eventKey={group.date} key={group.date} className="overflow-hidden shadow-sm">
                        <Accordion.Header className="px-2">
                            <div className="d-flex w-100 justify-content-between align-items-center pe-3">
                                <span className="fw-bold fs-5 text-dark">
                                    {new Date(group.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="badge-glass">
                                    {group.items.reduce((sum, i) => sum + (Number(i.hours) || 0), 0)} hrs
                                </span>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Table hover className="mb-0 table-glass" responsive>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40%' }}>Task</th>
                                        <th style={{ width: '35%' }}>Details</th>
                                        <th style={{ width: '15%' }} className="text-center">Hours</th>
                                        <th style={{ width: '10%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.items.map((entry) => (
                                        <tr key={entry.id} className="group-item-row">
                                            <td className="fw-medium text-dark">{entry.task}</td>
                                            <td className="small text-muted">{entry.details}</td>
                                            <td className="text-center fw-bold text-primary">{entry.hours}</td>
                                            <td className="text-end">
                                                <div className="d-flex justify-content-end gap-3">
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="text-muted p-0 opacity-50 hover-opacity-100 text-decoration-none"
                                                        onClick={() => onEdit(entry)}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="text-danger p-0 opacity-25 hover-opacity-100 text-decoration-none"
                                                        onClick={() => onDelete(entry.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            {entries.length === 0 && (
                <div className="text-center py-5 text-muted fade-in">
                    <p className="mb-0">No entries yet. Start by adding one above!</p>
                </div>
            )}
        </div>
    );
}
