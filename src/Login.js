import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            navigate('/');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-4 col-md-offset-4">
                    <h2 className="text-center">Login</h2>
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

                        <button type="button" className="btn btn-primary mt-3 center-block" onClick={handleLogin}>
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
