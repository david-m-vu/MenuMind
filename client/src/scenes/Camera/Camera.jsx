import TitleBanner from "../../components/TitleBanner/TitleBanner.jsx"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "./Camera.css"
import ReverseCameraIcon from "../../assets/icons/reverse-camera.svg"

const Camera = () => {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const headerRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [capturedImage, setCapturedImage] = useState(null)
    const [cameraHeight, setCameraHeight] = useState(0)
    const [facingMode, setFacingMode] = useState('environment')
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    // If navigated back from ImageSelection with an image, use it
    useEffect(() => {
        if (location.state && location.state.selectedImage) {
            setCapturedImage(location.state.selectedImage)
        }
    }, [location])

    useEffect(() => {
        // detect if multiple video inputs are available
        const detectDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices()
                const videoInputs = devices.filter(d => d.kind === 'videoinput')
                setHasMultipleCameras(videoInputs.length > 1)
            } catch (e) {
                // ignore
            }
        }
        detectDevices()

        let activeStream = null

        const startCamera = async () => {
            try {
                activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false })
                setStream(activeStream)
                if (videoRef.current) videoRef.current.srcObject = activeStream
            } catch (err) {
                console.error('Error accessing camera', err)
            }
        }
        startCamera()

        const updateCameraHeight = () => {
            const headerHeight = headerRef.current?.offsetHeight ?? 0
            const navbarHeight = document.querySelector('.Navbar')?.offsetHeight ?? 0
            const available = window.innerHeight - headerHeight - navbarHeight
            setCameraHeight(Math.max(available, 200))
        }

        updateCameraHeight()
        window.addEventListener('resize', updateCameraHeight)

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop())
            }
            window.removeEventListener('resize', updateCameraHeight)
        }
    }, [facingMode])

    const takePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const data = canvas.toDataURL('image/png')
        setCapturedImage(data)
        
        navigate('/camera/menu-info', { state: { image: data } })
    }

    const handleFlip = () => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
    }

    const handleUploadClick = () => {
        if (stream) {
            try {
                stream.getTracks().forEach(t => t.stop())
            } catch (e) {
                console.warn('Error stopping stream before upload navigation', e)
            }
        }
        navigate('/camera/upload', { state: { fromCamera: true } })
    }

    return (
        <div className="cameraScene">
            <div ref={headerRef}>
                <TitleBanner />
            </div>
            <div className="cameraContainer" style={{ height: cameraHeight ? `${cameraHeight}px` : undefined }}>
                <div className="cameraViewport">
                    {!capturedImage && (
                        <video ref={videoRef} autoPlay playsInline muted className="cameraVideo" />
                    )}

                    {capturedImage && (
                        <img src={capturedImage} alt="captured" className="capturedPreview" />
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <div className="cameraControls">
                    <button className="uploadButton" onClick={handleUploadClick}>Upload</button>
                    <button className="takePhotoButton" onClick={takePhoto} aria-label="Take photo" />
                    <button
                        className={`flipButton ${hasMultipleCameras ? '' : 'flipButton--disabled'}`}
                        onClick={() => { if (hasMultipleCameras) handleFlip() }}
                        aria-label="Flip camera"
                        aria-disabled={!hasMultipleCameras}
                        title={hasMultipleCameras ? 'Flip camera' : 'No secondary camera available'}
                    >
                        <img src={ReverseCameraIcon} alt="flip" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Camera;
