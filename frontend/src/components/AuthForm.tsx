import { useState } from 'react'
import { loginUser, registerUser } from '../api'

interface AuthFormProps {
    onLogin: (token: string) => void
}

function AuthForm({ onLogin }: AuthFormProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    function validateForm() {
        if (!username.trim()) {
            setMessage('Username cannot be blank.')
            return false
        }

        if (!password.trim()) {
            setMessage('Password cannot be blank.')
            return false
        }

        return true
    }

    async function handleRegister() {
        setMessage('')

        if (!validateForm()) {
            return
        }

        try {
            await registerUser(username.trim(), password)
            setMessage('Registration successful! You can now log in.')
        } catch (error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Registration failed'
            )
        }
    }

    async function handleLogin() {
        setMessage('')

        if (!validateForm()) {
            return
        }

        try {
            const data = await loginUser(username.trim(), password)

            localStorage.setItem('access_token', data.access_token)

            onLogin(data.access_token)
        } catch (error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Login failed'
            )
        }
    }

    return (
        <section className="auth-card">
            <h2>Welcome to Sonder!</h2>

            <p className="card-description">
                Sign in to enter, or create a new account.
            </p>

            <div className="form-group">
                <label htmlFor="username">Username</label>
                
                <input 
                    type="text"
                    value={username}
                    onChange={(event) =>
                        setUsername(event.target.value)
                    }
                    placeholder="Enter your username"
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                    type="text"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                />
            </div>

            <div className="auth-buttons">
                <button 
                    className="primary-button"
                    onClick={handleLogin}
                >
                    Log In
                </button>

                <button 
                    className="secondary-button"
                    onClick={handleRegister}
                >
                    Create Account
                </button>
            </div>

            {message && (
                <p className="message">
                    {message}
                </p>
            )}
        </section>
    )
}

export default AuthForm