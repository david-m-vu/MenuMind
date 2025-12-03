import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './ImageSelection.css'
import TitleBanner from '../../components/TitleBanner/TitleBanner.jsx'

// REFERENCE: Step 5 of: https://sandydev.medium.com/how-to-make-a-text-recognition-from-image-project-using-react-56dc00c84ee4

const ImageSelection = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

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

  const handleImageUpload = () => {
    if (!selectedImage) return
    navigate('/camera/menu-info', { state: { image: selectedImage} })
  }

  return (
    <div className="imageSelectionScene">
      <TitleBanner />
      <div className="imageSelectionContainer">
        <div className="uploader">
          <div className="uploaderHeader">
            <button type="button" className="backButton" onClick={() => navigate('/camera')}>Back</button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

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
            >
              Upload
            </button>

            <button
              className="submitButton"
              type="button"
              onClick={handleImageUpload}
              disabled={!selectedImage}
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
