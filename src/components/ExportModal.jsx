import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Download } from 'lucide-react';

export function ExportModal({ show, onHide, onExport }) {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const handleExport = () => {
        onExport(startDate, endDate);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">Export to Excel</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <p className="text-muted small mb-4">Select the date range for your work log export.</p>
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
