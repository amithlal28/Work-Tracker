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
        <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: '12px' }}>
            <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center mb-3">
                        <h6 className="text-secondary fw-bold small m-0 letter-spacing-1">NEW ENTRY</h6>
                    </div>
                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="border-0 bg-light fw-medium px-3 py-2"
                                style={{ borderRadius: '8px' }}
                            />
                        </Col>
                        <Col md={7}>
                            <Form.Control
                                type="text"
                                name="task"
                                placeholder="What did you work on?"
                                value={formData.task}
                                onChange={handleChange}
                                required
                                className="border-0 bg-light fw-medium px-3 py-2"
                                style={{ borderRadius: '8px' }}
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Control
                                type="number"
                                step="0.25"
                                name="hours"
                                placeholder="Hrs"
                                value={formData.hours}
                                onChange={handleChange}
                                required
                                className="border-0 bg-light fw-medium px-3 py-2"
                                style={{ borderRadius: '8px' }}
                            />
                        </Col>
                        <Col md={12}>
                            <Form.Control
                                as="textarea"
                                rows={1}
                                name="details"
                                placeholder="Add details (optional)..."
                                value={formData.details}
                                onChange={handleChange}
                                className="border-0 bg-white px-0 py-2 text-muted"
                                style={{ resize: 'none', borderBottom: '1px solid #eee' }}
                            />
                        </Col>
                        <Col md={12} className="d-flex justify-content-end mt-3">
                            <Button
                                variant="dark"
                                type="submit"
                                className="px-4 py-2 fw-medium d-flex align-items-center"
                                style={{ borderRadius: '8px' }}
                            >
                                <Plus size={18} className="me-1" /> Add
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}
