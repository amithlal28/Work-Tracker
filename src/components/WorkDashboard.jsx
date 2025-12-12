import React, { useMemo } from 'react';
import { Table, Button, Accordion } from 'react-bootstrap';
import { Trash2 } from 'lucide-react';

export function WorkDashboard({ entries, onDelete }) {
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
        <>
            <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                <h5 className="text-secondary fw-bold small m-0 letter-spacing-1">HISTORY</h5>
                <div className="text-end">
                    <span className="display-6 fw-bold text-dark">{grandTotal.toFixed(2)}</span>
                    <span className="text-muted ms-2 small fw-medium">Total Hours</span>
                </div>
            </div>

            <Accordion defaultActiveKey="0" flush className="w-100 bg-transparent">
                {groupedEntries.map(({ date, items, totalHours }, index) => (
                    <Accordion.Item eventKey={index.toString()} key={date} className="mb-3 border-0 bg-transparent">
                        <Accordion.Header className="accordion-modern-header">
                            <div className="d-flex w-100 justify-content-between align-items-center pe-3">
                                <h6 className="fw-bold text-dark m-0">
                                    {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </h6>
                                <span className="badge bg-white text-secondary fw-normal shadow-sm">
                                    {totalHours.toFixed(2)} hrs
                                </span>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body className="bg-white rounded-bottom shadow-sm pt-0">
                            <Table borderless size="sm" className="align-middle mb-0 mt-2">
                                <tbody>
                                    {items.map(entry => (
                                        <tr key={entry.id} className="border-bottom-0">
                                            <td style={{ width: '40%' }} className="card-text fw-medium text-dark ps-0">
                                                {entry.task}
                                            </td>
                                            <td style={{ width: '40%' }} className="text-muted small">
                                                {entry.details}
                                            </td>
                                            <td style={{ width: '10%' }} className="text-end fw-bold text-secondary">
                                                {entry.hours.toFixed(2)}
                                            </td>
                                            <td style={{ width: '10%' }} className="text-end pe-0">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="text-danger p-0 opacity-25 hover-opacity-100 text-decoration-none"
                                                    onClick={() => onDelete(entry.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </>
    );
}
