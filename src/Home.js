import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';

function Home() {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    const handleLogout = () => {
        sessionStorage.removeItem('loggedInUser');
        navigate('/login');
    };

    const handleVideoMeeting = () => {
        navigate('/video');
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="6" className="text-center">
                    <h2>Home</h2>
                    {loggedInUser ? (
                        <div>
                            <p>Welcome, {loggedInUser.username}</p>
                            <Button variant="primary" onClick={handleLogout}>Logout</Button>
                            <Button variant="primary" onClick={handleVideoMeeting}>Video  Meeting</Button>
                        </div>
                    ) : (
                        <p>Please <a href="/login">login</a> or <a href="/register">register</a></p>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default Home;
