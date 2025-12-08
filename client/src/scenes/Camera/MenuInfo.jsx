import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TitleBanner from '../../components/TitleBanner/TitleBanner.jsx'
import { analyzeMenuImage } from '../../requests/menu-analysis.js'
import './MenuInfo.css'

const MenuInfo = ({ usePlaceholder = false }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const image = location.state?.image ?? null
  const userProfile = location.state?.userProfile ?? { dietaryRestrictions: [], dietaryConditions: [] }
  const fetchAI = location.state?.fetchAI ?? false
  
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [aiResult, setAiResult] = useState(location.state?.aiResult ?? { 
    menuItems: [], 
    itemScores: [], 
    itemCriteria: [] 
  })
  const [error, setError] = useState(null)

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

  const recommendations = aiResult.recommendations ?? []
  const avoid = aiResult.avoid ?? []
  const confidence = aiResult.confidence ?? null

  // Raw AI data for filtering in MenuInfo
  const menuItems = aiResult.menuItems ?? []
  const itemScores = aiResult.itemScores ?? []
  const itemCriteria = aiResult.itemCriteria ?? []

  useEffect(() => {
    if (!image) {
      navigate('/camera')
    }
  }, [image, navigate])

  // FOR TESTING: Show user profile info
  useEffect(() => {
    console.log('User Profile:', userProfile)
    console.log('Dietary Restrictions:', userProfile.dietaryRestrictions)
    console.log('Dietary Conditions:', userProfile.dietaryConditions)
  }, [userProfile])

  // Fetch AI analysis when instructed
  useEffect(() => {
    if (fetchAI && image && !usePlaceholder) {
      const fetchAnalysis = async () => {
        setIsLoading(true)
        setProgress(10)
        setError(null)
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analysis timeout')), 20000)
        )
        
        try {
          const resultPromise = analyzeMenuImage(
            image,
            userProfile.dietaryConditions,
            userProfile.dietaryRestrictions,
            true // useOCR = true for Tesseract
          )
          
          // Race between the API call and timeout
          const result = await Promise.race([resultPromise, timeoutPromise])
          
          setProgress(100)
          setAiResult(result)
          setIsLoading(false)
        } catch (err) {
          console.error('Failed to analyze menu:', err)
          setIsLoading(false)
          setError('Failed to load recommendations')
          setAiResult({
            menuItems: [],
            itemScores: [],
            itemCriteria: [],
          })
        }
      }
      
      fetchAnalysis()
    }
  }, [fetchAI, image, userProfile, usePlaceholder])

  // Loading bar (simulated progress while waiting for API)
  useEffect(() => {
    if (isLoading) {
      const progressIntervals = [
        { time: 500, value: 25 },
        { time: 1500, value: 50 },
        { time: 2500, value: 75 },
        { time: 3500, value: 90 },
      ]
      
      const timeouts = progressIntervals.map(interval => 
        setTimeout(() => {
          if (progress < interval.value) {
            setProgress(interval.value)
          }
        }, interval.time)
      )
      
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout))
      }
    }
  }, [isLoading, progress])

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

        {isLoading && !error && (
          <div className="loadingContainer">
            <div className="progressBarWrapper">
              <div className="progressBar" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="loadingText">Loading recommendations... {progress}%</p>
          </div>
        )}

        {!usePlaceholder && !isLoading && recommendedItems.length === 0 && riskyItems.length === 0 && (
          <div className={error ? "noRecommendations noRecommendations--error" : "noRecommendations"}>
            <p>{error || 'No recommendations found.'}</p>
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
