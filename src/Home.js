import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css'

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
        <div className="container">
            <div className="row justify-content-md-center">
                <div className="col-md-12 text-center">
                    <h2>테스트!</h2>
                    <div className="image-container" style={{ marginBottom: '20px' }}>
                        <img src="/img/s.png" className="img-fluid" alt="Responsive" />
                    </div>
                    {loggedInUser ? (
                        <div>
                            <p>Welcome, {loggedInUser.username}</p>
                            <button className="btn btn-primary" onClick={handleLogout} style={{ marginRight: '10px' }}>Logout</button>
                            <button className="btn btn-primary" onClick={handleVideoMeeting}>Video Meeting</button>
                        </div>
                    ) : (
                        <div>
                            <p>Please </p>
                            <Link to="/login" className="btn btn-primary" style={{ marginRight: '10px' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
