import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TitleBanner from '../../components/TitleBanner/TitleBanner.jsx'
import './MenuInfo.css'

const MenuInfo = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const image = location.state?.image ?? null
  const tempText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
  laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
  Sed ut perspiciatis unde omnis iste natus error sit 
  voluptatem accusantium doloremque laudantium, totam rem aperiam, 
  eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
  `

  useEffect(() => {
    if (!image) {
      navigate('/camera')
    }
  }, [image, navigate])

  const handleRetake = () => {
    navigate('/camera')
  }

  const handleSubmit = () => {
    navigate('/home')
  }

  if (!image) return null

  return (
    <div className="menuInfoScene">
      <TitleBanner />
      <div className="menuInfoContent">
        <h2 className="menuInfoPreviewTitle">Preview</h2>
        <div className="menuInfoPreviewWrap">
          <img src={image} alt="menu preview" className="menuInfoPreviewImage" />
        </div>
        <h2 className="menuInfoPreviewTitle">Information</h2>
        <p className="menuInfoText">{tempText}</p>
      </div>

      <div className="menuInfoActions">
        <button className="menuInfoRetake" onClick={handleRetake}>Retake</button>
        <button className="menuInfoSubmit" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  )
}

export default MenuInfo
