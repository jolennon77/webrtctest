import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = () => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        navigate('/login');
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="4">
                    <h2 className="text-center">Register</h2>
                    <Form>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mt-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" className="mt-3" onClick={handleRegister}>
                            Register
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Register;
