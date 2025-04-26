import React, { useState } from 'react';
import axios from 'axios';

function SignupPage() {
    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        team_id: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        const { username, password, confirmPassword, team_id } = form;
        
        if (!username || !password || !confirmPassword || !team_id) {
            alert('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_SERVER_BASEAPI}/auth/signup`, {
                username,
                password,
                confirmPassword,
                team_id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('User successfully signed up');

            // ✅ Clear the form after successful signup
            setForm({
                username: '',
                password: '',
                confirmPassword: '',
                team_id: ''
            });

        } catch (err) {
            alert('Signup failed: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div>
            <h1>Admin Signup</h1>
            <input 
                name="username" 
                placeholder="Username" 
                value={form.username} 
                onChange={handleChange} 
            />
            <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                value={form.password} 
                onChange={handleChange} 
            />
            <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Re-enter Password" 
                value={form.confirmPassword} 
                onChange={handleChange} 
            />
            <input 
                name="team_id" 
                placeholder="Team ID" 
                value={form.team_id} 
                onChange={handleChange} 
            />
            <button onClick={handleSignup}>Signup</button>
        </div>
    );
}

export default SignupPage;
