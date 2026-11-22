import { useState } from 'react'
import AuthForm from './AuthForm'
import { Kanban, Sparkles } from 'lucide-react'
import '../templates/launch.css'

interface LaunchProps {
    onLogin: (token: string) => void
}

function Launch({ onLogin } : LaunchProps) {

    const [page, setPage] = useState<'title' | 'about' | 'login'>('title')

    return (
        <section className="launch-screen">
            {page === 'title' && (
                <div className="title-section">
                    <header className="app-header">
                        <h1>SONDER</h1>
                        <p className="subtext">Connect with the world around you.</p>
                    </header>

                    <div 
                        className="to-about-button"
                        onClick={() => {setPage('about')}}
                    >
                        <Kanban />
                        <Sparkles />
                    </div>
                </div>
            )}

            {page === 'about' && (
                <div>
                    <header className="about-header">
                        <h1>SONDER</h1>
                        <p className="subtext">Connect with the world around you.</p>
                    </header>

                    <div className="about-blurb">
                        <p>Sonder is an ambient, low-friction social web app designed for low-commitment, meaningful human connection.</p>
                        <p>While traditional social apps demand sustained conversation, which can feel draining, high-pressure, or awkward,
                            Sonder reimagines social interaction as an idle, continuous experience.
                        </p>
                    </div>

                    <div className="options-section">
                        <p>Want to learn more?</p>

                        <div className="option-section-buttons">
                            <button
                                className="about-button"
                            >
                                About
                            </button>

                            <button
                                className="login-button"
                                onClick={() => {setPage('login')}}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {page === 'login' && (
                <div className="login-section">
                    <AuthForm onLogin={onLogin} />
                </div>
            )}
        </section>
    )
}

export default Launch