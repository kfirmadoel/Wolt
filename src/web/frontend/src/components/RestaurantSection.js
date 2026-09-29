// src/components/RestaurantSection.js
import React from 'react';
import RestaurantCard from './RestaurantCard';
import '../css/RestaurantSection.css';

function RestaurantSection({ title, icon, subtitle, restaurants, isPromoted = false, calculateDistance = false }) {
    if (!restaurants || restaurants.length === 0) {
        return null;
    }

    return (
        <section className="restaurant-section">
            <div className="section-header">
                <div className="section-title-group">
                    <h2 className="section-title">
                        {icon && <span className="section-icon">{icon}</span>}
                        <span>{title}</span>
                    </h2>
                    {subtitle && <p className="section-subtitle">{subtitle}</p>}
                </div>
                <span className="section-count-badge">{restaurants.length} places</span>
            </div>

            <div className="restaurant-grid">
                {restaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        isPromoted={isPromoted || restaurant.isPromoted}
                        distance={calculateDistance ? restaurant.calculatedDistance : undefined}
                    />
                ))}
            </div>
        </section>
    );
}

export default RestaurantSection;

