import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../helper/api';
import '../css/Commerce.css';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const headingRef = useRef(null);

    useEffect(() => {
        headingRef.current?.focus();
    }, []);

    useEffect(() => {
        let active = true;
        const loadOrders = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await apiFetch('/api/orders');
                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.error || 'Could not load your orders.');
                }
                const data = await response.json();
                if (active) setOrders(Array.isArray(data) ? data : []);
            } catch (requestError) {
                if (active) setError(requestError.message || 'Could not reach the server.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadOrders();
        return () => { active = false; };
    }, []);

    return (
        <main className="commerce-page">
            <div className="commerce-heading-row">
                <div>
                    <Link to="/" className="commerce-back-link">← Back to restaurants</Link>
                    <h1 ref={headingRef} tabIndex="-1">Order history</h1>
                </div>
                <Link to="/cart" className="commerce-secondary-link">View cart</Link>
            </div>

            {location.state?.orderConfirmation && (
                <p className="commerce-success" role="status">{location.state.orderConfirmation}</p>
            )}
            {loading && <p className="commerce-state">Loading your orders...</p>}
            {error && <p className="commerce-error" role="alert">{error}</p>}
            {!loading && !error && orders.length === 0 && (
                <section className="commerce-empty-state">
                    <span aria-hidden="true">🧾</span>
                    <h2>No orders yet</h2>
                    <p>Your completed orders will appear here.</p>
                    <Link to="/" className="commerce-primary-link">Browse restaurants</Link>
                </section>
            )}

            {!loading && orders.length > 0 && (
                <div className="order-history-list">
                    {orders.map((order) => (
                        <article className="order-history-item" key={order.id}>
                            <header className="order-history-header">
                                <div>
                                    <h2>{order.restaurantName || 'Restaurant order'}</h2>
                                    <p>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date unavailable'}</p>
                                </div>
                                <div className="order-history-meta">
                                    <span className="order-status">{order.status || 'Submitted'}</span>
                                    <strong>₪{Number(order.totalPrice || 0).toFixed(2)}</strong>
                                </div>
                            </header>
                            <div className="order-history-lines">
                                {(order.items || []).map((item, index) => (
                                    <div className="order-history-line" key={`${item.productId || item.id || index}-${index}`}>
                                        {item.picture && <img src={item.picture} alt="" />}
                                        <span>{item.name || `Menu item ${item.productId || item.id || ''}`}</span>
                                        <span>× {item.quantity}</span>
                                        {item.price !== undefined && <strong>₪{(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong>}
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default OrdersPage;