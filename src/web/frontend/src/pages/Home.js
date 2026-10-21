// src/pages/Home.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../helper/api';
import { useAuth } from '../context/AuthContext';
import CategoryFilter, { CATEGORY_ICONS } from '../components/CategoryFilter';
import RestaurantSection from '../components/RestaurantSection';
import SearchResults from '../components/SearchResults';
import '../css/Home.css';

const getRestaurantCategories = (restaurant) => {
    const categories = Array.isArray(restaurant.categories)
        ? restaurant.categories
        : [restaurant.category];

    return categories
        .filter((category) => typeof category === 'string')
        .map((category) => category.trim())
        .filter(Boolean);
};

function Home() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [inPageSearch, setInPageSearch] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const searchInputRef = useRef(null);
    const sectionsRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Get the authenticated user so we can read their saved geolocation
    const { user } = useAuth();

    // Fetch all restaurants dynamically from the server
    const fetchRestaurants = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch('/api/restaurants');
            if (!res.ok) {
                throw new Error('Failed to load restaurants');
            }
            const data = await res.json();
            setRestaurants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            setError('Could not connect to the Wolt server. Please check your backend connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    // Read the search query from the URL (set by the Navbar search bar or direct link)
    const urlQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('q') || '';
    }, [location.search]);

    // Perform a search request against the backend search API
    const performSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }

        setSearchLoading(true);
        try {
            const res = await apiFetch(`/api/search/${encodeURIComponent(query.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults({
                    query: query.trim(),
                    restaurants: data.restaurants || [],
                    products: data.products || []
                });
            } else {
                setSearchResults({ query: query.trim(), restaurants: [], products: [] });
            }
        } catch (err) {
            console.error('Search request failed, falling back to client-side filtering:', err);
            // Fallback: filter the already-loaded restaurants on the client side
            const lower = query.toLowerCase();
            const matching = restaurants.filter(
                (r) =>
                    r.name?.toLowerCase().includes(lower) ||
                    r.description?.toLowerCase().includes(lower) ||
                    getRestaurantCategories(r).some((category) => category.toLowerCase().includes(lower))
            );
            setSearchResults({ query: query.trim(), restaurants: matching, products: [] });
        } finally {
            setSearchLoading(false);
        }
    }, [restaurants]);

    // React to URL search query changes (triggered by Navbar or hero search bar)
    useEffect(() => {
        if (urlQuery) {
            setInPageSearch(urlQuery);
            performSearch(urlQuery);
        } else {
            setSearchResults(null);
            setInPageSearch('');
        }
    }, [urlQuery, performSearch]);

    // Handle the in-page hero search bar form submit
    const handleInPageSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = inPageSearch.trim();
        if (trimmed) {
            navigate(`/?q=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/');
        }
    };

    const handleClearSearch = () => {
        setInPageSearch('');
        setSearchResults(null);
        navigate('/');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    /**
     * Get the user's geolocation from their profile.
     * Returns null if the user is not logged in or has not set a location yet.
     */
    const userCoords = useMemo(() => {
        if (user && user.location &&
            typeof user.location.x === 'number' &&
            typeof user.location.y === 'number') {
            return { x: user.location.x, y: user.location.y };
        }
        return null;
    }, [user]);

    /**
     * Calculate the straight-line distance (in km) between two geographic coordinates.
     * Uses a simplified flat-Earth approximation suitable for short distances.
     * 1 degree of latitude ≈ 111 km.
     */
    const calcDistance = useCallback((restLocation, from) => {
        if (!restLocation || typeof restLocation.x !== 'number' || typeof restLocation.y !== 'number') {
            return null;
        }
        if (!from) return null;

        const toRadians = (degrees) => (degrees * Math.PI) / 180;
        const latitudeDelta = toRadians(restLocation.x - from.x);
        const longitudeDelta = toRadians(restLocation.y - from.y);
        const latitude1 = toRadians(from.x);
        const latitude2 = toRadians(restLocation.x);
        const haversine =
            Math.sin(latitudeDelta / 2) ** 2 +
            Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
        const safeHaversine = Math.min(1, Math.max(0, haversine));
        const distance = 6371 * 2 * Math.atan2(Math.sqrt(safeHaversine), Math.sqrt(1 - safeHaversine));
        return parseFloat(distance.toFixed(1));
    }, []);

    // Attach a calculatedDistance field to every restaurant (null when no user location is set)
    const restaurantsWithDistance = useMemo(() => {
        return restaurants.map((r) => {
            const dist = calcDistance(r.location, userCoords);
            return { ...r, calculatedDistance: dist };
        });
    }, [restaurants, userCoords, calcDistance]);

    const categories = useMemo(() => {
        return Array.from(new Set(restaurants.flatMap(getRestaurantCategories)))
            .sort((first, second) => first.localeCompare(second));
    }, [restaurants]);

    const filteredRestaurants = useMemo(() => {
        if (selectedCategory === 'all') {
            return restaurantsWithDistance;
        }
        return restaurantsWithDistance.filter((restaurant) => {
            return getRestaurantCategories(restaurant).some(
                (category) => category.toLowerCase() === selectedCategory.toLowerCase()
            );
        });
    }, [restaurantsWithDistance, selectedCategory]);

    const promotedRestaurants = useMemo(() => {
        return filteredRestaurants.filter((restaurant) => restaurant.isPromoted === true);
    }, [filteredRestaurants]);

    const nearbyRestaurants = useMemo(() => {
        if (!userCoords) {
            return filteredRestaurants.slice(0, 6);
        }

        return [...filteredRestaurants]
            .filter((restaurant) => restaurant.calculatedDistance !== null)
            .sort((first, second) => first.calculatedDistance - second.calculatedDistance)
            .slice(0, 6);
    }, [filteredRestaurants, userCoords]);

    const selectedCategoryIcon = selectedCategory === 'all'
        ? CATEGORY_ICONS.All
        : CATEGORY_ICONS[selectedCategory] || '🍽️';

    // Message shown when the user has not set their location yet
    const noLocationBanner = userCoords === null && !loading && restaurants.length > 0;

    return (
        <main className="home-container">
            {/* Hero Discovery Banner */}
            <div className="wolt-hero-banner">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>🚀</span>
                        <span>DELIVERING NOW</span>
                    </div>
                    <h1 className="hero-title">Delivered right to your door.</h1>
                    <p className="hero-subtitle">
                        Discover top-rated restaurants, sweet bakeries, fresh groceries, and more.
                    </p>

                    {/* Hero Search Bar */}
                    <form className="hero-search-box" onSubmit={handleInPageSearchSubmit}>
                        <span className="hero-search-icon">🔍</span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="hero-search-input"
                            placeholder="Find restaurants, burgers, sushi..."
                            value={inPageSearch}
                            onChange={(e) => setInPageSearch(e.target.value)}
                        />
                        <button type="submit" className="hero-search-btn">
                            Search
                        </button>
                    </form>
                </div>
                <div className="hero-graphic" aria-hidden="true">
                    🍔
                </div>
            </div>

            {/* Banner prompting the user to set their delivery location in their profile */}
            {noLocationBanner && user && (
                <div className="location-missing-banner" onClick={() => navigate('/profile')} role="button" tabIndex={0}>
                    <span>📍</span>
                    <span>
                        Set your location in your{' '}
                        <strong>profile</strong> to see nearby restaurants sorted by distance.
                    </span>
                    <span className="location-banner-arrow">→</span>
                </div>
            )}

            {/* Quick Category Filters */}
            <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* Main Content Area */}
            <div ref={sectionsRef}>
                {loading || searchLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner" />
                        <p>Loading Wolt restaurants...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h3>Connection Issue</h3>
                        <p>{error}</p>
                        <button type="button" className="retry-btn" onClick={fetchRestaurants}>
                            Try Again
                        </button>
                    </div>
                ) : searchResults ? (
                    /* Search Results */
                    <SearchResults
                        query={searchResults.query}
                        restaurants={searchResults.restaurants}
                        products={searchResults.products}
                        onClear={handleClearSearch}
                        allRestaurants={restaurants}
                    />
                ) : restaurants.length === 0 ? (
                    /* Empty state when the server has no restaurants yet */
                    <div className="empty-restaurants-container">
                        <div className="empty-icon">🍽️</div>
                        <h3>No Restaurants Available Yet</h3>
                        <p>
                            The server currently has no registered restaurants. Log in as a restaurant
                            owner to add new restaurants, or check back soon!
                        </p>
                        <button
                            type="button"
                            className="demo-seed-btn"
                            onClick={fetchRestaurants}
                        >
                            🔄 Refresh Restaurants
                        </button>
                    </div>
                ) : filteredRestaurants.length === 0 ? (
                    <div className="empty-restaurants-container">
                        <div className="empty-icon">{selectedCategoryIcon}</div>
                        <h3>No {selectedCategory} Restaurants</h3>
                        <p>No restaurants in this category are currently available.</p>
                    </div>
                ) : (
                    /* Main categorized discovery screen */
                    <>
                        {/* Promoted Restaurants — featured picks */}
                        <RestaurantSection
                            title={selectedCategory === 'all' ? 'Promoted Restaurants' : `Promoted ${selectedCategory} Restaurants`}
                            icon="⭐"
                            subtitle="Restaurants marked as promoted"
                            restaurants={promotedRestaurants}
                        />

                        {/* Nearby Restaurants — sorted by distance from the user's profile location */}
                        <RestaurantSection
                            title={userCoords
                                ? (selectedCategory === 'all' ? 'Nearby Restaurants' : `Nearby ${selectedCategory} Restaurants`)
                                : (selectedCategory === 'all' ? 'Restaurants' : `${selectedCategory} Restaurants`)}
                            icon="📍"
                            subtitle={
                                userCoords
                                    ? 'Sorted by distance from your saved location'
                                    : 'Set your location in your profile to sort by distance'
                            }
                            restaurants={nearbyRestaurants}
                            calculateDistance={true}
                        />

                        {/* All Restaurants or filtered by category */}
                        <RestaurantSection
                            title={
                                selectedCategory === 'all'
                                    ? 'All Restaurants'
                                    : `${selectedCategory} Restaurants`
                            }
                            icon={selectedCategoryIcon}
                            subtitle={
                                selectedCategory === 'all'
                                    ? 'Explore every restaurant and store available for delivery'
                                    : `Showing places serving ${selectedCategory}`
                            }
                            restaurants={filteredRestaurants}
                            calculateDistance={true}
                        />
                    </>
                )}
            </div>
        </main>
    );
}

export default Home;