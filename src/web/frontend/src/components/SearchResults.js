// src/components/SearchResults.js
import React from 'react';
import { Link } from 'react-router-dom';
import RestaurantCard from './RestaurantCard';
import '../css/SearchResults.css';

function SearchResults({ query, restaurants = [], products = [], onClear, allRestaurants = [] }) {
    const totalResults = restaurants.length + products.length;

    // Helper map to find restaurant name for a product
    const restaurantMap = allRestaurants.reduce((acc, r) => {
        acc[r.id] = r.name;
        return acc;
    }, {});

    if (totalResults === 0) {
        return (
            <div className="search-empty-state">
                <div className="search-empty-icon">🔍</div>
                <h3>No results found</h3>
                <p>We couldn't find any restaurants or items matching "<strong>{query}</strong>".</p>
                <button type="button" className="clear-search-btn" onClick={onClear}>
                    Clear search and see all restaurants
                </button>
            </div>
        );
    }

    return (
        <div className="search-results-container">
            <div className="search-results-header">
                <div className="search-title-area">
                    <h2>
                        Search results for "<span className="search-query-highlight">{query}</span>"
                    </h2>
                    <p className="search-summary-text">
                        Found {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
                        {products.length > 0 && ` and ${products.length} ${products.length === 1 ? 'item' : 'items'}`}
                    </p>
                </div>
                <button type="button" className="clear-search-btn" onClick={onClear}>
                    ✕ Clear search
                </button>
            </div>

            {/* Matching Restaurants */}
            {restaurants.length > 0 && (
                <div className="restaurant-grid">
                    {restaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
            )}

            {/* Matching Dishes / Products */}
            {products.length > 0 && (
                <div className="products-results-section">
                    <h3 className="products-results-title">
                        <span>🍽️</span> Matching Dishes & Products
                    </h3>
                    <div className="products-grid">
                        {products.map((product) => {
                            const restaurantName = restaurantMap[product.restaurantId] || 'View Restaurant';
                            return (
                                <div key={product.id} className="product-card">
                                    <div>
                                        <h4 className="product-name">{product.name}</h4>
                                        <p className="product-desc">
                                            {product.description || 'Delicious dish freshly prepared.'}
                                        </p>
                                    </div>
                                    <div className="product-footer">
                                        <span className="product-price">₪{product.price}</span>
                                        <Link
                                            to={`/restaurant/${product.restaurantId}`}
                                            className="product-restaurant-link"
                                        >
                                            {restaurantName} →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchResults;

