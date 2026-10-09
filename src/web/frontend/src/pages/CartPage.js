import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../helper/api';
import { useCart } from '../context/CartContext';
import '../css/Commerce.css';

function CartPage() {
    const { restaurantId, restaurantName, items, total, changeQuantity, removeItem, clearCart } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const headingRef = useRef(null);

    useEffect(() => {
        headingRef.current?.focus();
    }, []);

    const submitOrder = async () => {
        if (!restaurantId || items.length === 0) return;
        setSubmitting(true);
        setError('');
        try {
            const response = await apiFetch('/api/orders', {
                method: 'POST',
                body: JSON.stringify({
                    restaurantId,
                    items: items.map(({ product, quantity }) => ({ productId: product.id, quantity }))
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Could not submit your order.');
            }

            const order = await response.json();
            clearCart();
            navigate('/orders', { replace: true, state: { orderConfirmation: `Order ${order.id} was placed successfully.` } });
        } catch (requestError) {
            setError(requestError.message || 'Could not reach the server. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="commerce-page">
            <div className="commerce-heading-row">
                <div>
                    <Link to="/" className="commerce-back-link">← Back to restaurants</Link>
                    <h1 ref={headingRef} tabIndex="-1">Your cart</h1>
                    {restaurantName && <p className="commerce-subtitle">From {restaurantName}</p>}
                </div>
                <Link to="/orders" className="commerce-secondary-link">Order history</Link>
            </div>

            {items.length === 0 ? (
                <section className="commerce-empty-state">
                    <span aria-hidden="true">🛒</span>
                    <h2>Your cart is empty</h2>
                    <p>Add dishes from a restaurant to start an order.</p>
                    <Link to="/" className="commerce-primary-link">Browse restaurants</Link>
                </section>
            ) : (
                <div className="cart-layout">
                    <section className="cart-items" aria-label="Cart items">
                        {items.map(({ product, quantity }) => (
                            <article className="cart-item" key={product.id}>
                                {product.picture && <img src={product.picture} alt={product.name} />}
                                <div className="cart-item-details">
                                    <h2>{product.name}</h2>
                                    {product.description && <p>{product.description}</p>}
                                    <strong>₪{Number(product.price).toFixed(2)}</strong>
                                </div>
                                <div className="cart-item-controls">
                                    <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                                        <button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label={`Decrease ${product.name} quantity`}>−</button>
                                        <span>{quantity}</span>
                                        <button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label={`Increase ${product.name} quantity`}>+</button>
                                    </div>
                                    <button type="button" className="commerce-remove-btn" onClick={() => removeItem(product.id)}>Remove</button>
                                </div>
                                <strong className="cart-line-total">₪{(Number(product.price) * quantity).toFixed(2)}</strong>
                            </article>
                        ))}
                    </section>

                    <aside className="cart-summary">
                        <h2>Summary</h2>
                        <div className="cart-summary-line"><span>Items</span><span>{items.reduce((count, item) => count + item.quantity, 0)}</span></div>
                        <div className="cart-summary-total"><span>Total</span><strong>₪{total.toFixed(2)}</strong></div>
                        {error && <p className="commerce-error" role="alert">{error}</p>}
                        <button type="button" className="commerce-primary-button" disabled={submitting} onClick={submitOrder}>
                            {submitting ? 'Placing order...' : 'Place order'}
                        </button>
                    </aside>
                </div>
            )}
        </main>
    );
}

export default CartPage;