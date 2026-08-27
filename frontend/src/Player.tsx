import { useEffect, useState } from 'react'

interface PlayerProps {
    username: string
}

function Player({ username }: PlayerProps) {
    const [online, setOnline] = useState(true)

    useEffect(() => {
        console.log(`${username} joined the campus`)
    }, [])
    
    return (
        <div>
            <p>
                Player: {username} - {online ? 'Online' : 'Offline'}
            </p>

            <button onClick={() => setOnline(!online)}>
                {online ? 'Go Offline' : 'Go Online'}
            </button>
        </div>
    )
}

export default Player