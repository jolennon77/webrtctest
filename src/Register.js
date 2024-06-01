import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className="container">
            <div className="row">
                <div className="col-md-4 col-md-offset-4">
                    <h2 className="text-center">Register</h2>
                    <form>
                        <div className="form-group">
                            <label htmlFor="formUsername">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formUsername"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="form-group mt-3">
                            <label htmlFor="formPassword">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="formPassword"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="button" className="btn btn-primary mt-3 center-block" onClick={handleRegister}>
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
