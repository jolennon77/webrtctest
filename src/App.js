import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import VideoMeeting from './components/VideoMeeting';

function App() {
    return (
        <Router>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/">SimpleAuth</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/login">Login</Nav.Link>
                        <Nav.Link href="/register">Register</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/video" element={<VideoMeeting />} />
                    <Route path="/" element={<Home />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;
