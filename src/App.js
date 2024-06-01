import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import VideoMeeting from './components/VideoMeeting';

function App() {
    return (
        <Router>
            <nav className="navbar navbar-inverse navbar-expand-lg">
                <div className="container">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#navbarNav">
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <Link className="navbar-brand" to="/" style={{display: 'inline-flex', alignItems: 'center'}}>
                            <img src="/img/s.png" alt="Logo"
                                 style={{height: '30px', marginRight: '10px', display: 'inline-block'}}/>
                            <span style={{display: 'inline-block'}}>슬리슬리</span>
                        </Link>
                    </div>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="nav navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/register">Register</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container mt-4">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/video" element={<VideoMeeting />} />
                    <Route path="/" element={<Home />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
