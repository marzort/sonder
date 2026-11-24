import { useState } from 'react'
import { Eye, EyeOff, Cloud } from 'lucide-react'
import { loginUser, registerUser } from '../api'
import '../templates/auth.css'
import About from '../components/About'

interface AuthFormProps {
    onLogin: (token: string) => void
}

function AuthForm({ 
    onLogin
} : AuthFormProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState('')

    const [authScreen, setAuthScreen] = useState<'login' | 'about'>('login')

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev)
    }

    const [signup, setSignup] = useState(false)

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
            setSignup(false)
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
        <section>
            {authScreen === 'login' && (
                <div>
                    <header className="app-header">
                        <h1
                            style={{ 
                                cursor: 'pointer'
                            }}
                            onClick={() => {setAuthScreen('about')}}
                        >
                            SONDER
                        </h1>
                        <p className="subtext">Connect with the world around you.</p>
                    </header>
                    
                    <section className="auth-card">
                        <h2>Welcome to Sonder!</h2>

                        <p className="card-description">
                            {signup === true ? 'Create a new account' : 'Sign in to enter'}
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
                            <div className="input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                />

                                <button
                                    className="show-password-button"
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>             
                        </div>

                        <div className="auth-buttons">
                            <button 
                                className="primary-button"
                                onClick={
                                    signup === true 
                                    ? handleRegister
                                    : handleLogin
                                }
                            >
                                {signup === true ? 'Create Account' : 'Log In'}
                            </button>

                             <div className="sign-up-section">
                                <p
                                    className="sign-up-text"
                                    onClick={() => 
                                        setSignup(!signup)
                                    }
                                >
                                    <Cloud size={18}/>
                                    {signup === false 
                                        ? 'New to Sonder? Create an account!'
                                        : 'Have an account? Return to login!'
                                    }
                                </p>
                            </div>
                        </div>

                       
                        

                        {message && (
                            <p className="message">
                                {message}
                            </p>
                        )}
                    </section>
                </div>
            )}

            {authScreen === 'about' && (
                <div>
                    <button
                        className="back-button"
                        onClick={() => {setAuthScreen('login')}}
                    >
                        Back
                    </button>

                    <About />
                </div>
            )}
            
        </section>
    )
}

export default AuthForm