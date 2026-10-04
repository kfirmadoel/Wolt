// src/pages/RestaurantDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../helper/api';
import '../css/RestaurantSection.css';

function RestaurantDetail() {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [restRes, prodRes] = await Promise.all([
                    apiFetch(`/api/restaurants/${id}`),
                    apiFetch(`/api/restaurants/${id}/products`)
                ]);

                if (!restRes.ok) {
                    throw new Error('Restaurant not found');
                }

                const restData = await restRes.json();
                setRestaurant(restData);

                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setProducts(Array.isArray(prodData) ? prodData : []);
                }
            } catch (err) {
                console.error(err);
                setError(err.message || 'Error loading restaurant');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <h2>Loading restaurant...</h2>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <h2>Restaurant Not Found</h2>
                <p>{error}</p>
                <Link to="/" style={{ color: 'var(--wolt-blue)', fontWeight: 'bold' }}>
                    ← Back to all restaurants
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px 80px' }}>
            <Link to="/" style={{ color: 'var(--wolt-blue)', fontWeight: 'bold', display: 'inline-block', marginBottom: '16px' }}>
                ← Back to Discovery
            </Link>

            <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '20px',
                padding: '30px',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '30px'
            }}>
                {restaurant.picture && (
                    <img
                        src={restaurant.picture}
                        alt={restaurant.name}
                        style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }}
                    />
                )}
                <h1 style={{ margin: '0 0 10px', fontSize: '2.2rem', fontWeight: 900 }}>{restaurant.name}</h1>
                {restaurant.description && (
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px', fontSize: '1.05rem' }}>
                        {restaurant.description}
                    </p>
                )}
                {(restaurant.address || restaurant.phone || restaurant.deliveryTime) && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {restaurant.address && <span>📍 {restaurant.address}</span>}
                        {restaurant.phone && <span>📞 {restaurant.phone}</span>}
                        {restaurant.deliveryTime && <span>🚴 {restaurant.deliveryTime}</span>}
                    </div>
                )}
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px' }}>Menu Items</h2>
            {products.length === 0 ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)'
                }}>
                    <p>No menu items listed yet for this restaurant.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    {products.map((item) => (
                        <div key={item.id} style={{
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '16px',
                            padding: '20px',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem' }}>{item.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
                                {item.description}
                            </p>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--wolt-blue)' }}>
                                ₪{item.price}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RestaurantDetail;

