import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Download } from 'lucide-react';

export function ExportModal({ show, onHide, onExport, availableTasks = [] }) {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedTasks, setSelectedTasks] = useState([]);

    const handleExport = () => {
        // If empty, we pass empty array which logic treats as "All"
        onExport(startDate, endDate, selectedTasks);
        onHide();
    };

    const toggleTask = (task) => {
        if (selectedTasks.includes(task)) {
            setSelectedTasks(selectedTasks.filter(t => t !== task));
        } else {
            setSelectedTasks([...selectedTasks, task]);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">Export to Excel</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <p className="text-muted small mb-4">Select the filters for your work log export.</p>
                <Form>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">FROM</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="shadow-sm border-0 bg-light"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">TO</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="shadow-sm border-0 bg-light"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary mb-2">TASKS (LEAVE EMPTY FOR ALL)</Form.Label>
                                <div className="bg-light p-3 rounded shadow-sm border-0" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {availableTasks.length === 0 && <span className="text-muted small">No tasks found.</span>}
                                    {availableTasks.map((task, index) => (
                                        <Form.Check
                                            key={index}
                                            type="checkbox"
                                            id={`task-${index}`}
                                            label={task}
                                            checked={selectedTasks.includes(task)}
                                            onChange={() => toggleTask(task)}
                                            className="mb-2 small"
                                        />
                                    ))}
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="link" className="text-muted text-decoration-none" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="success" onClick={handleExport} className="fw-bold px-4 shadow-sm">
                    <Download size={16} className="me-2" />
                    Download .xlsx
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
