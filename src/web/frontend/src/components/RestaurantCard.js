// src/components/RestaurantCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/RestaurantCard.css';

// Curated high-quality food image URLs matching popular restaurant themes
const FOOD_IMAGES = {
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
    asian: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    dessert: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
    mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
    drinks: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
};

// Select image based on restaurant name and description
const getRestaurantImage = (restaurant) => {
    if (restaurant.picture || restaurant.image) {
        return restaurant.picture || restaurant.image;
    }

    const text = `${restaurant.name || ''} ${restaurant.description || ''}`.toLowerCase();
    for (const [key, url] of Object.entries(FOOD_IMAGES)) {
        if (key !== 'default' && text.includes(key)) {
            return url;
        }
    }
    return FOOD_IMAGES.default;
};

// Deterministic rating based on restaurant id so it stays stable
const getRestaurantRating = (id) => {
    let hash = 0;
    const str = String(id || 'wolt');
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    const positiveHash = Math.abs(hash);
    const score = (8.5 + (positiveHash % 15) / 10).toFixed(1);
    return score;
};

// Deterministic delivery time based on restaurant id
const getDeliveryTime = (id) => {
    let hash = 0;
    const str = String(id || 'time');
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    const times = ['15–25 min', '20–30 min', '25–35 min', '30–40 min'];
    return times[Math.abs(hash) % times.length];
};

function RestaurantCard({ restaurant, isPromoted, distance }) {
    const [isFavorite, setIsFavorite] = useState(false);

    const imageUrl = getRestaurantImage(restaurant);
    const rating = getRestaurantRating(restaurant.id);
    const deliveryTime = getDeliveryTime(restaurant.id);

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorite((prev) => !prev);
    };

    return (
        <Link to={`/restaurant/${restaurant.id}`} className="wolt-restaurant-card">
            {/* Card Header Image */}
            <div className="card-image-wrapper">
                <img
                    src={imageUrl}
                    alt={restaurant.name}
                    className="card-image"
                    loading="lazy"
                />

                {/* Favorite Heart Button */}
                <button
                    type="button"
                    className="card-favorite-btn"
                    onClick={handleFavoriteClick}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label="Toggle favorite"
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>

                {/* Top Badges */}
                <div className="card-badges-top-left">
                    {isPromoted && (
                        <span className="badge-promoted">⭐ PROMOTED</span>
                    )}
                    {distance !== undefined && (
                        <span className="badge-nearby">📍 {distance} km</span>
                    )}
                </div>

                {/* Delivery Time Badge */}
                <div className="badge-delivery-time">
                    <span>🚴</span>
                    <span>{deliveryTime}</span>
                </div>
            </div>

            {/* Card Details Body */}
            <div className="card-body">
                <div className="card-title-row">
                    <h3 className="card-restaurant-name">{restaurant.name}</h3>
                    <div className="card-rating-badge">
                        <span>★</span>
                        <span>{rating}</span>
                    </div>
                </div>

                <p className="card-description">
                    {restaurant.description || 'Delicious meals delivered fresh to your door.'}
                </p>

                <div className="card-footer">
                    <span className="card-delivery-fee">
                        {isPromoted ? '🎉 Free delivery' : '🛵 ₪10 delivery'}
                    </span>
                    <span className="card-address">
                        {restaurant.address || 'Tel Aviv Area'}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default RestaurantCard;

