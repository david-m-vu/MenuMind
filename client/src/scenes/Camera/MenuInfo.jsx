import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TitleBanner from '../../components/TitleBanner/TitleBanner.jsx'
import './MenuInfo.css'

const MenuInfo = ({ usePlaceholder = false }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const image = location.state?.image ?? null
  const userProfile = location.state?.userProfile ?? { dietaryRestrictions: [], dietaryConditions: [] }
  const aiResult = location.state.aiResult


  // Placeholder data for testing/demo mode
  const placeholderRecommended = [
    { name: 'Grilled Salmon Salad', reason: 'High in omega-3, gluten-free' },
    { name: 'Quinoa Buddha Bowl', reason: 'Plant-based, nutrient-rich' },
    { name: 'Chicken & Veggie Stir-Fry', reason: 'Low dairy, customizable' },
  ]

  const placeholderRisky = [
    { name: 'Creamy Pasta Carbonara', reason: 'Contains dairy, gluten' },
    { name: 'Spicy Buffalo Wings', reason: 'High spice level' },
    { name: 'Shellfish Paella', reason: 'Contains shellfish allergen' },
  ]

  const recommendations = aiResult.recommendations
  const avoid = aiResult.avoid
  const confidence = aiResult.confidence

  useEffect(() => {
    if (!image) {
      navigate('/camera')
    }
  }, [image, navigate])

  useEffect(() => {
    console.log('User Profile:', userProfile)
    console.log('Dietary Restrictions:', userProfile.dietaryRestrictions)
    console.log('Dietary Conditions:', userProfile.dietaryConditions)
  }, [userProfile])

  const handleRetake = () => {
    navigate('/camera')
  }

  const handleSubmit = () => {
    navigate('/home')
  }

  if (!image) return null

  const recommendedItems = usePlaceholder ? placeholderRecommended : recommendations
  const riskyItems = usePlaceholder ? placeholderRisky : avoid

  return (
    <div className="menuInfoScene">
      <TitleBanner />
      <div className="menuInfoContent">
        <h2 className="menuInfoPreviewTitle">Preview</h2>
        <div className="menuInfoPreviewWrap">
          <img src={image} alt="menu preview" className="menuInfoPreviewImage" />
        </div>

        {usePlaceholder && (
          <div className="placeholderBadge">Using Placeholder Data</div>
        )}

        {confidence && (
          <div className="placeholderBadge">Image Confidence: {confidence}</div>
        )}

        {(recommendedItems.length > 0 || riskyItems.length > 0) && (
          <div className="menuInfoRecommendations">
            {recommendedItems.length > 0 && (
              <div className="recommendationSection">
                <h3 className="sectionTitle sectionTitle--recommended">Recommended Items</h3>
                <ul className="itemList">
                  {recommendedItems.map((item, idx) => (
                    <li key={idx} className="menuItem">
                      <span className="itemMarker itemMarker--green"></span>
                      <div className="itemDetails">
                        <span className="itemName">{item.name}</span>
                        <span className="itemReason">{item.reason}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {riskyItems.length > 0 && (
              <div className="recommendationSection">
                <h3 className="sectionTitle sectionTitle--risky">Risky Items</h3>
                <ul className="itemList">
                  {riskyItems.map((item, idx) => (
                    <li key={idx} className="menuItem">
                      <span className="itemMarker itemMarker--red"></span>
                      <div className="itemDetails">
                        <span className="itemName">{item.name}</span>
                        <span className="itemReason">{item.reason}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!usePlaceholder && recommendedItems.length === 0 && riskyItems.length === 0 && (
          <div className="noRecommendations">
            <p>AI analysis will appear here after processing...</p>
          </div>
        )}
      </div>

      <div className="menuInfoActions">
        <button className="menuInfoRetake" onClick={handleRetake}>Retake</button>
        <button className="menuInfoSubmit" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  )
}

export default MenuInfo
