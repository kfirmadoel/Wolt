// src/components/RestaurantCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/RestaurantCard.css';

function RestaurantCard({ restaurant, isPromoted, distance }) {
    return (
        <Link to={`/restaurant/${restaurant.id}`} className="wolt-restaurant-card">
            {/* Card Header Image */}
            <div className="card-image-wrapper">
                {restaurant.picture ? (
                    <img
                        src={restaurant.picture}
                        alt={restaurant.name}
                        className="card-image"
                        loading="lazy"
                    />
                ) : (
                    <div className="card-image-placeholder" aria-label="Restaurant image not provided">
                        <span aria-hidden="true">🍽️</span>
                    </div>
                )}

                {/* Nearby distance badge */}
                <div className="card-badges-top-left">
                    {distance !== undefined && (
                        <span className="badge-nearby">📍 {distance} km</span>
                    )}
                </div>

                {isPromoted && (
                    <span className="badge-promoted card-promoted-badge">⭐ PROMOTED</span>
                )}

                {restaurant.deliveryTime && (
                    <div className="badge-delivery-time">
                        <span>🚴</span>
                        <span>{restaurant.deliveryTime}</span>
                    </div>
                )}
            </div>

            {/* Card Details Body */}
            <div className="card-body">
                <div className="card-title-row">
                    <h3 className="card-restaurant-name">{restaurant.name}</h3>
                    {restaurant.rating !== undefined && restaurant.rating !== null && (
                        <div className="card-rating-badge">
                            <span>★</span>
                            <span>{restaurant.rating}</span>
                        </div>
                    )}
                </div>

                {restaurant.description && <p className="card-description">{restaurant.description}</p>}

                {(restaurant.deliveryFee !== undefined || restaurant.address) && (
                    <div className="card-footer">
                        {restaurant.deliveryFee !== undefined && (
                            <span className="card-delivery-fee">
                                {Number(restaurant.deliveryFee) === 0
                                    ? 'Free delivery'
                                    : `₪${restaurant.deliveryFee} delivery`}
                            </span>
                        )}
                        {restaurant.address && <span className="card-address">{restaurant.address}</span>}
                    </div>
                )}
            </div>
        </Link>
    );
}

export default RestaurantCard;

