import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Plus } from 'lucide-react';

export function WorkEntryForm({ onSave }) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        task: '',
        hours: '',
        details: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.task || !formData.hours) return;

        onSave({
            ...formData,
            hours: parseFloat(formData.hours) || 0
        });

        setFormData(prev => ({
            ...prev,
            task: '',
            hours: '',
            details: ''
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <React.Fragment>
            <div className="glass-panel p-4 mb-5">
                <Form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center mb-4">
                        <div className="p-2 rounded-circle bg-white bg-opacity-50 me-3 shadow-sm">
                            <Plus size={20} className="text-primary" />
                        </div>
                        <h6 className="text-dark fw-bold small m-0 letter-spacing-1">NEW ENTRY</h6>
                    </div>
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Label className="small text-muted fw-bold ps-1">Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="glass-input"
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small text-muted fw-bold ps-1">Task</Form.Label>
                            <Form.Control
                                type="text"
                                name="task"
                                placeholder="What did you work on?"
                                value={formData.task}
                                onChange={handleChange}
                                required
                                className="glass-input"
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Label className="small text-muted fw-bold ps-1">Hours</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.25"
                                name="hours"
                                placeholder="Hrs"
                                value={formData.hours}
                                onChange={handleChange}
                                required
                                className="glass-input"
                            />
                        </Col>
                        <Col md={12}>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="details"
                                placeholder="Add details (optional)..."
                                value={formData.details}
                                onChange={handleChange}
                                className="glass-input"
                                style={{ resize: 'none' }}
                            />
                        </Col>
                        <Col md={12} className="d-flex justify-content-end mt-2">
                            <Button
                                type="submit"
                                className="btn-glass-primary px-4 py-2 d-flex align-items-center"
                            >
                                <Plus size={18} className="me-2" /> Add Entry
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </React.Fragment>
    );
}
