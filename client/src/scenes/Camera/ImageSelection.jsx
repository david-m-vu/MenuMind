import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './ImageSelection.css'
import TitleBanner from '../../components/TitleBanner/TitleBanner.jsx'
// import fetch from 'node-fetch';

// REFERENCE: Step 5 of: https://sandydev.medium.com/how-to-make-a-text-recognition-from-image-project-using-react-56dc00c84ee4

const ImageSelection = ({ userProfile = { dietaryRestrictions: [], dietaryConditions: [] } }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [error, setError] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  
  // Get userProfile from navigation state (passed from Camera) or use prop
  const profileToUse = location.state?.userProfile || userProfile

  const handleImageChange = (e) => {
    const imageFile = e?.target?.files && e.target.files[0]
    if (!imageFile) return
    processFile(imageFile)
  }

  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImage)
      }
    }
  }, [selectedImage])

  // helper to process a File and set object URL, revoking previous
  const processFile = (file) => {
    if (!file) return
    setError(false)
    if (selectedImage && selectedImage.startsWith('blob:')) {
      try { URL.revokeObjectURL(selectedImage) } catch (e) { /* ignore */ }
    }
    const url = URL.createObjectURL(file)
    setSelectedImage(url)
  }

  useEffect(() => {
    const fromCamera = Boolean(location.state && location.state.fromCamera)
    if (!fromCamera && !selectedImage) {
      navigate('/camera')
    }
  }, [location, selectedImage, navigate])

  // drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleImageUpload = async () => {
    if (!selectedImage) return

    const blob = await fetch(selectedImage).then(r => r.blob())
    const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
    setIsLoadingResults(true)
    
      const url = new URL(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/analyze-menu`)

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,                                   
          conditions: profileToUse.dietaryConditions,      
          restrictions: profileToUse.dietaryRestrictions 
        }),
      })

    const aiResult = await response.json()
    setIsLoadingResults(false)
    if(aiResult.confidence != "error"){
      setError(false)
      navigate('/camera/menu-info', { state: { image: selectedImage, userProfile: profileToUse, aiResult: aiResult} })
    }else {
      setError(true)
      setSelectedImage(null)
    }
    
  }

  return (
    <div className="imageSelectionScene">
      <TitleBanner />
      <div className="imageSelectionContainer">
        {isLoadingResults && (
                                <div className="homeLoadingOverlay" aria-live="polite">
                                    <div className="loader"></div>
                                    <p>Analyzing menu...</p>
                                </div>
                            )}
        <div className="uploader">
          <div className="uploaderHeader">
            <button type="button" className="backButton" onClick={() => navigate('/camera')}>Back</button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          
          {error && (
          <div className="placeholderBadge ">An error occured. Please try again with another image</div>
           )}

          {!selectedImage && (
            <div className="noImagePlaceholder" onDrop={handleDrop} onDragOver={handleDragOver}>
              Drag & drop an image here or upload
            </div>
          )}

          {selectedImage && (
            <div className="previewWrap">
              <img src={selectedImage} alt="preview" className="previewImage" />
            </div>
          )}

          <div className="actions">
            <button
              type="button"
              onClick={() => {
                // open file picker to (re-)upload
                fileInputRef.current && fileInputRef.current.click()
              }}
              disabled={isLoadingResults}
            >
              Upload
            </button>

              
            <button
              className="submitButton"
              type="button"
              onClick={handleImageUpload}
              disabled={!selectedImage || isLoadingResults}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageSelection
