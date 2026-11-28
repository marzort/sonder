import { useState, useRef } from 'react'
import AuthForm from './AuthForm'
import { Kanban, Sparkles } from 'lucide-react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import '../templates/launch.css'

interface LaunchProps {
    onLogin: (token: string) => void
}

type LaunchPage = 'title' | 'about' | 'login'

function Launch({ 
    onLogin
} : LaunchProps) {

    const [page, setPage] = useState<LaunchPage>('title')

    const titleRef = useRef<HTMLDivElement>(null)
    const aboutRef = useRef<HTMLDivElement>(null)
    const loginRef = useRef<HTMLDivElement>(null)

    const nodeRefs: Record<LaunchPage, React.RefObject<HTMLDivElement | null>> = {
        title: titleRef,
        about: aboutRef,
        login: loginRef
    }

    const currentRef = nodeRefs[page]

    return (
        <section className="launch-screen">
            <SwitchTransition mode="out-in">
                <CSSTransition
                    key={page}
                    nodeRef={currentRef}
                    timeout={300}
                    classNames="launch-fade"
                    unmountOnExit
                >
                    <div ref={currentRef} className="launch-step">
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
                                    <p>Have you ever taken a look at the world around you and realized that every 
                                        single person is living a life as vivid and complex as your own?
                                    </p>
                                    <p>That sensation is known as sonder, which is an experience that this app is designed to evoke.</p>
                                    <p>Sonder is an app that seeks to connect people in a way that requires little to no commitment.</p>
                                    <p>While traditional social apps demand sustained conversation, which can feel draining, high-pressure, or awkward,
                                        Sonder reimagines social interaction as an idle, continuous experience.
                                    </p>
                                </div>

                                <div className="options-section">
                                    <div 
                                        className="to-about-button"
                                        onClick={() => {setPage('login')}}
                                    >
                                        <Kanban />
                                        <Sparkles />
                                    </div> 
                                </div>
                            </div>
                        )}

                        {page === 'login' && (
                            <div className="login-section">
                                <AuthForm onLogin={onLogin} />
                            </div>
                        )}
                    </div>
                </CSSTransition>
            </SwitchTransition>

        </section>
    )
}

export default Launch