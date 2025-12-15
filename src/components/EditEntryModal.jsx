import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Save } from 'lucide-react';

export function EditEntryModal({ show, onHide, entry, onSave }) {
    const [formData, setFormData] = useState({
        date: '',
        task: '',
        hours: '',
        details: '',
    });

    useEffect(() => {
        if (entry) {
            setFormData({
                date: entry.date,
                task: entry.task,
                hours: entry.hours,
                details: entry.details || '',
            });
        }
    }, [entry]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...entry,
            ...formData,
            hours: parseFloat(formData.hours) || 0
        });
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fs-5 fw-bold text-dark">Edit Entry</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Label className="small text-muted fw-bold mb-1">Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="input-modern"
                            />
                        </Col>
                        <Col md={12}>
                            <Form.Label className="small text-muted fw-bold mb-1">Task</Form.Label>
                            <Form.Control
                                type="text"
                                name="task"
                                placeholder="What did you work on?"
                                value={formData.task}
                                onChange={handleChange}
                                required
                                className="input-modern"
                            />
                        </Col>
                        <Col md={12}>
                            <Form.Label className="small text-muted fw-bold mb-1">Hours</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.25"
                                name="hours"
                                placeholder="Hrs"
                                value={formData.hours}
                                onChange={handleChange}
                                required
                                className="input-modern"
                            />
                        </Col>
                        <Col md={12}>
                            <Form.Label className="small text-muted fw-bold mb-1">Details</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="details"
                                placeholder="Add details..."
                                value={formData.details}
                                onChange={handleChange}
                                className="input-modern"
                                style={{ resize: 'none' }}
                            />
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button variant="light" onClick={onHide}>Cancel</Button>
                        <Button variant="dark" type="submit" className="d-flex align-items-center">
                            <Save size={16} className="me-2" /> Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
