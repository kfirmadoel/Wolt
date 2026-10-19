import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../helper/api';
import { useAuth } from '../context/AuthContext';
import '../css/Commerce.css';

async function readOrder(orderId) {
    const response = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`);
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Could not load the order.');
    }
    return response.json();
}

function OrderHistory({ userId, token }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [editing, setEditing] = useState(false);
    const [draftItems, setDraftItems] = useState([]);
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState('');
    const location = useLocation();
    const headingRef = useRef(null);
    const activeRef = useRef(false);
    const listRequestRef = useRef(0);
    const detailRequestRef = useRef(0);
    const pendingRef = useRef(false);
    const confirmation = location.state?.orderUserId === userId ? location.state.orderConfirmation : '';

    const sameSession = useCallback(() => activeRef.current &&
        localStorage.getItem('userId') === userId && localStorage.getItem('token') === token, [userId, token]);

    const loadOrders = useCallback(async () => {
        const requestId = ++listRequestRef.current;
        setLoading(true);
        setError('');
        try {
            const response = await apiFetch('/api/orders');
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Could not load your orders.');
            }
            const data = await response.json();
            if (sameSession() && requestId === listRequestRef.current) {
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (requestError) {
            if (sameSession() && requestId === listRequestRef.current) setError(requestError.message || 'Could not reach the server.');
        } finally {
            if (sameSession() && requestId === listRequestRef.current) setLoading(false);
        }
    }, [sameSession]);

    useEffect(() => {
        activeRef.current = true;
        headingRef.current?.focus();
        loadOrders();
        return () => {
            activeRef.current = false;
            listRequestRef.current += 1;
            detailRequestRef.current += 1;
        };
    }, [loadOrders]);

    const loadDetails = async (orderId) => {
        const requestId = ++detailRequestRef.current;
        setSelectedId(orderId);
        setSelectedOrder(null);
        setEditing(false);
        setDetailLoading(true);
        setDetailError('');
        try {
            const order = await readOrder(orderId);
            if (sameSession() && requestId === detailRequestRef.current) setSelectedOrder(order);
        } catch (requestError) {
            if (sameSession() && requestId === detailRequestRef.current) setDetailError(requestError.message || 'Could not load the order.');
        } finally {
            if (sameSession() && requestId === detailRequestRef.current) setDetailLoading(false);
        }
    };

    const closeDetails = () => {
        if (pendingRef.current) return;
        detailRequestRef.current += 1;
        setSelectedId('');
        setSelectedOrder(null);
        setEditing(false);
        setDetailError('');
    };

    const refreshOrders = () => {
        if (pendingRef.current || editing) return;
        closeDetails();
        loadOrders();
    };

    const startEditing = () => {
        if (pendingRef.current || !selectedOrder) return;
        setDraftItems(selectedOrder.items.map((item) => ({ ...item })));
        setDetailError('');
        setMessage('');
        setEditing(true);
    };

    const changeQuantity = (index, delta) => {
        if (pendingRef.current) return;
        setDraftItems((current) => current.map((item, itemIndex) => itemIndex === index
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item));
    };

    const saveOrder = async () => {
        if (pendingRef.current || !selectedOrder || !sameSession()) return;
        if (draftItems.length === 0 || draftItems.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
            setDetailError('Keep at least one dish with a positive whole quantity.');
            return;
        }
        pendingRef.current = true;
        setPending(true);
        setDetailError('');
        setMessage('');
        try {
            const response = await apiFetch(`/api/orders/${encodeURIComponent(selectedOrder.id)}`, {
                method: 'PATCH',
                body: JSON.stringify({ items: draftItems.map(({ productId, quantity }) => ({ productId, quantity })) })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const requestError = new Error(data.error || 'Could not update the order.');
                requestError.status = response.status;
                throw requestError;
            }
            if (!sameSession()) return;
            setMessage('Order updated.');
            await loadDetails(selectedOrder.id);
            if (sameSession()) await loadOrders();
        } catch (requestError) {
            if (sameSession()) {
                setDetailError(requestError.status ? requestError.message : 'Could not confirm the update. Cancel editing and refresh your orders before trying again.');
            }
        } finally {
            pendingRef.current = false;
            if (sameSession()) setPending(false);
        }
    };

    const deleteOrder = async () => {
        if (pendingRef.current || !selectedOrder || !sameSession()) return;
        if (!window.confirm('Delete this order from your history?')) return;
        pendingRef.current = true;
        setPending(true);
        setDetailError('');
        setMessage('');
        try {
            const response = await apiFetch(`/api/orders/${encodeURIComponent(selectedOrder.id)}`, { method: 'DELETE' });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const requestError = new Error(data.error || 'Could not delete the order.');
                requestError.status = response.status;
                throw requestError;
            }
            if (!sameSession()) return;
            setOrders((current) => current.filter((order) => order.id !== selectedOrder.id));
            setSelectedId('');
            setSelectedOrder(null);
            setEditing(false);
            setMessage('Order deleted.');
            await loadOrders();
        } catch (requestError) {
            if (sameSession()) {
                setDetailError(requestError.status ? requestError.message : 'Could not confirm the deletion. Refresh your orders before trying again.');
            }
        } finally {
            pendingRef.current = false;
            if (sameSession()) setPending(false);
        }
    };

    return (
        <main className="commerce-page">
            <div className="commerce-heading-row">
                <div>
                    <Link to="/" className="commerce-back-link">← Back to restaurants</Link>
                    <h1 ref={headingRef} tabIndex="-1">Order history</h1>
                </div>
                <div className="commerce-actions">
                    <button type="button" className="commerce-secondary-button" disabled={loading || pending || editing} onClick={refreshOrders}>Refresh orders</button>
                    <Link to="/cart" className="commerce-secondary-link">View cart</Link>
                </div>
            </div>

            {(message || confirmation) && (
                <p className="commerce-success" role="status">{message || confirmation}</p>
            )}
            {loading && <p className="commerce-state">Loading your orders...</p>}
            {error && <p className="commerce-error" role="alert">{error}</p>}
            {!loading && !error && orders.length === 0 && (
                <section className="commerce-empty-state">
                    <span aria-hidden="true">🧾</span>
                    <h2>No orders yet</h2>
                    <p>Your submitted orders will appear here.</p>
                    <Link to="/" className="commerce-primary-link">Browse restaurants</Link>
                </section>
            )}

            {orders.length > 0 && (
                <div className="order-history-list">
                    {orders.map((order) => {
                        const selected = selectedId === order.id;
                        const displayedOrder = selected && selectedOrder ? selectedOrder : order;
                        const displayedItems = selected && editing ? draftItems : displayedOrder.items || [];
                        const displayedTotal = selected && editing
                            ? draftItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0)
                            : Number(displayedOrder.totalPrice || 0);
                        return (
                            <article className="order-history-item" key={order.id}>
                                <header className="order-history-header">
                                    <div>
                                        <h2>{displayedOrder.restaurantName || 'Restaurant order'}</h2>
                                        <p>{displayedOrder.createdAt ? new Date(displayedOrder.createdAt).toLocaleString() : 'Date unavailable'}</p>
                                    </div>
                                    <div className="order-history-meta">
                                        <span className="order-status">{displayedOrder.status || 'Submitted'}</span>
                                        <strong>{selected && editing ? 'Estimated: ' : ''}₪{displayedTotal.toFixed(2)}</strong>
                                    </div>
                                </header>
                                <div className="order-history-lines">
                                    {displayedItems.map((item, index) => (
                                        <div className="order-history-line" key={`${item.productId || index}-${index}`}>
                                            {item.picture ? <img src={item.picture} alt="" /> : <span aria-hidden="true">🍽️</span>}
                                            <div>
                                                <span>{item.name || `Menu item ${item.productId || ''}`}</span>
                                                {selected && selectedOrder && item.description && <p className="order-item-description">{item.description}</p>}
                                            </div>
                                            {selected && editing ? (
                                                <div className="cart-item-controls">
                                                    <div className="quantity-control">
                                                        <button type="button" disabled={pending || item.quantity <= 1} onClick={() => changeQuantity(index, -1)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                                                        <span>{item.quantity}</span>
                                                        <button type="button" disabled={pending} onClick={() => changeQuantity(index, 1)} aria-label={`Increase ${item.name} quantity`}>+</button>
                                                    </div>
                                                    <button type="button" className="commerce-remove-btn" disabled={pending} onClick={() => {
                                                        if (!pendingRef.current) setDraftItems((current) => current.filter((entry, itemIndex) => itemIndex !== index));
                                                    }}>Remove</button>
                                                </div>
                                            ) : <span>× {item.quantity}</span>}
                                            {item.price !== undefined && <strong>₪{(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong>}
                                        </div>
                                    ))}
                                </div>
                                <div className="order-detail-actions">
                                    {selected ? (
                                        <>
                                            {detailLoading && <p className="commerce-state">Loading order details...</p>}
                                            {detailError && <p className="commerce-error" role="alert">{detailError}</p>}
                                            {selectedOrder && <p className="commerce-subtitle">Order {selectedOrder.id}</p>}
                                            {editing && <p className="commerce-subtitle">Keep at least one dish. Prices are recalculated from the current menu when you save.</p>}
                                            <div className="commerce-actions">
                                                {editing ? (
                                                    <>
                                                        <button type="button" className="commerce-primary-button" disabled={pending || draftItems.length === 0} onClick={saveOrder}>{pending ? 'Saving...' : 'Save changes'}</button>
                                                        <button type="button" className="commerce-secondary-button" disabled={pending} onClick={() => { setEditing(false); setDetailError(''); }}>Cancel editing</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {selectedOrder && <button type="button" className="commerce-secondary-button" disabled={pending || detailLoading} onClick={startEditing}>Edit items</button>}
                                                        {selectedOrder && <button type="button" className="commerce-remove-btn" disabled={pending || detailLoading} onClick={deleteOrder}>{pending ? 'Please wait...' : 'Delete order'}</button>}
                                                        {!selectedOrder && !detailLoading && <button type="button" className="commerce-secondary-button" disabled={pending} onClick={() => loadDetails(order.id)}>Retry details</button>}
                                                        <button type="button" className="commerce-secondary-button" disabled={pending} onClick={closeDetails}>Close details</button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    ) : <button type="button" className="commerce-secondary-button" disabled={pending || editing} onClick={() => { if (!pendingRef.current) loadDetails(order.id); }}>View details</button>}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

function OrdersPage() {
    const { userId, token } = useAuth();
    return <OrderHistory key={`${userId}:${token}`} userId={userId} token={token} />;
}

export default OrdersPage;
