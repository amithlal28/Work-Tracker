import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Download, FileJson } from 'lucide-react';

export function ExportModal({ show, onHide, onExport, onExportJson, availableTasks = [] }) {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedTasks, setSelectedTasks] = useState([]);

    const handleExport = () => {
        // If empty, we pass empty array which logic treats as "All"
        onExport(startDate, endDate, selectedTasks);
        onHide();
    };

    const handleExportJson = () => {
        if (onExportJson) {
            onExportJson();
            onHide();
        }
    };

    const toggleTask = (task) => {
        if (selectedTasks.includes(task)) {
            setSelectedTasks(selectedTasks.filter(t => t !== task));
        } else {
            setSelectedTasks([...selectedTasks, task]);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="export-modal">
            <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                <Modal.Title className="fw-bold fs-4 text-dark d-flex align-items-center gap-2">
                    <Download className="text-primary" size={24} />
                    Export Work Log
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pt-3 pb-4">
                <p className="text-muted mb-4 fs-6">
                    Filter your logged hours by date range and specific tasks to generate a customized report.
                </p>

                <div className="modern-card p-4 mb-4 bg-light border-0">
                    <Form>
                        <Row className="g-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary mb-2">DATE RANGE</Form.Label>
                                    <div className="date-range-row">
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="input-modern shadow-sm"
                                        />
                                        <span className="text-muted fw-bold to-label">to</span>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="input-modern shadow-sm"
                                        />
                                    </div>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary mb-2 d-flex justify-content-between">
                                        <span>TASKS FILTER</span>
                                        <span className="text-primary" style={{ cursor: 'pointer' }} onClick={() => setSelectedTasks([])}>Clear Filters</span>
                                    </Form.Label>
                                    <div className="task-filter-container p-3 rounded bg-white shadow-sm border border-subtle" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {availableTasks.length === 0 ? (
                                            <div className="text-center py-4 text-muted small">No tasks found in the selected date range.</div>
                                        ) : (
                                            <div className="d-flex flex-wrap gap-2">
                                                {availableTasks.map((task, index) => {
                                                    const isSelected = selectedTasks.includes(task) || selectedTasks.length === 0;
                                                    return (
                                                        <div
                                                            key={index}
                                                            onClick={() => toggleTask(task)}
                                                            className={`task-pill px-3 py-2 rounded-pill small border transition-all ${isSelected ? 'bg-primary text-white border-primary fw-medium' : 'bg-white text-secondary border-subtle'} hover-active`}
                                                            style={{ cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none' }}
                                                        >
                                                            {task}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <Form.Text className="text-muted small mt-2">
                                        <span className="fw-medium">Pro tip:</span> Leave all tasks unselected to include everything.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 px-4 pb-4 pt-0 d-flex justify-content-between">
                <Button variant="link" className="text-secondary text-decoration-none fw-medium" onClick={onHide}>
                    Cancel
                </Button>
                <div className="d-flex gap-2">
                    <Button variant="white" onClick={handleExportJson} className="d-flex align-items-center gap-2 fw-medium px-4 modern-btn-outline shadow-sm text-dark border-subtle">
                        <FileJson size={18} className="text-accent" />
                        JSON Format
                    </Button>
                    <Button variant="primary" onClick={handleExport} className="d-flex align-items-center gap-2 fw-medium px-4 shadow-sm btn-hover-lift">
                        <Download size={18} />
                        Excel Format
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
