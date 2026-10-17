import '../templates/trackinganimation.css'
import clouds from '../assets/clouds.png'

export default function TrackingAnimation () {
    return (
        <div className="tracker-animation">
            <div className="scroll-track">
                <div className="scroll-group">
                    <div className="cloud-box">
                        <img src={clouds}/>
                    </div>
                    <div className="cloud-box">
                        <img src={clouds}/>
                    </div>
                    <div className="cloud-box">
                        <img src={clouds}/>
                    </div>
                </div>
                        
                <div className="scroll-group">
                    <div className="cloud-box" aria-hidden="true">
                        <img src={clouds}/>
                    </div>
                    <div className="cloud-box">
                        <img src={clouds}/>
                    </div>
                    <div className="cloud-box">
                        <img src={clouds}/>
                    </div>
                </div>
            
            </div>
            
        </div>
    )
}