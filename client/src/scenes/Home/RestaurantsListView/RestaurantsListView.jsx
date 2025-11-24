import "./RestaurantsListView.css"

import LocationMarkerIcon from "../../../assets/icons/location-marker-icon.svg"
import WebsiteIcon from "../../../assets/icons/www-icon.png"
import InstagramIcon from "../../../assets/icons/Instagram_Glyph_Gradient.svg"

const getMiles = (meters) => {
    return meters * 0.000621371192;
}

const RestaurantsListView = ({ results, searchOffset = 0 }) => {
    const listPaddingTop = searchOffset > 0 ? `calc(${searchOffset}px + 2.25rem)` : undefined

    return (
        <div
            className="homeListView"
            style={listPaddingTop ? { paddingTop: listPaddingTop } : undefined}
        >
            {results.length === 0 ? (
                <p className="homeListEmpty">Start a search to see curated picks.</p>
            ) : (
                results.map((restaurant) => {
                    const website = restaurant.website
                    const instagramHandle = restaurant.social_media?.instagram
                    const instagramUrl = instagramHandle ? `https://www.instagram.com/${instagramHandle}` : null

                    return (
                    <button
                        key={restaurant.fsq_place_id}
                        type="button"
                        className="homeListCard"
                    >
                        <div className="homeListEyebrow">
                            <p className="homeListEyebrow">{restaurant?.categories?.map((category) => category.name).join(", ") ?? "Restaurant"}</p>
                        </div>
                        <div className="homeListTop">
                            <img
                                className="homeListIcon"
                                src={`${restaurant.categories[0].icon.prefix}88${restaurant.categories[0].icon.suffix}`}
                                alt=""
                            />
                            <div className="homeListDetails">
                                <div>
                                    <div className="homeListCardHeader">
                                        <h3>{restaurant.name}</h3>
                                        <p className="homeListDistance">{getMiles(restaurant.distance).toFixed(1)} mi</p>
                                    </div>
                                    <div className="homeListLocation">
                                        <img
                                            className="homeListLocationIcon"
                                            src={LocationMarkerIcon}
                                            alt="location marker icon"
                                        />
                                        <p className="homeListAddress">
                                            {restaurant.location?.formatted_address ?? restaurant.location?.address ?? ""}
                                        </p>
                                    </div>
                                </div>

                                {(restaurant.fit_score || website || instagramUrl) && (
                                    <div className="homeListScoreLinksRow">
                                        {restaurant.fit_score && (
                                            <div className="homeListScoreContainer">
                                                Fit Score: <span className="homeListScore">{restaurant.fit_score}/5</span>
                                            </div>
                                        )}
                                        {(website || instagramUrl) && (
                                            <div className="homeListLinks">
                                                {website && (
                                                    <a
                                                        className="homeListLink"
                                                        href={website}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <img className="homeListLinkIcon" src={WebsiteIcon} alt="" />
                                                        <span>Website</span>
                                                    </a>
                                                )}
                                                {instagramUrl && (
                                                    <a
                                                        className="homeListLink"
                                                        href={instagramUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <img className="homeListLinkIcon" src={InstagramIcon} alt="" />
                                                        <span>Instagram</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="homeListBottom">
                            <h4 className="homeListWhyHere">Why Here?</h4>
                            <ul>
                                {restaurant.positives.map((positive, index) => (
                                    <li key={`positive-${index}`}>{positive}</li>
                                ))}
                            </ul>
                            <h4 className="homeListConsider">Things to Consider</h4>
                            <ul>
                                {restaurant.negatives.map((positive, index) => (
                                    <li key={`positive-${index}`}>{positive}</li>
                                ))}
                            </ul>
                            <h4 className="homeListAdditionalNotes">Assumptions/Additional Notes:</h4>
                            {restaurant.notes && <p className="homeListNotes">{restaurant.notes}</p>}
                        </div>

                    </button>
                )})
            )}
        </div>
    )
}

export default RestaurantsListView;
