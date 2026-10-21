import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../helper/api';
import { useCart } from '../context/CartContext';
import '../css/Commerce.css';

function CartPage() {
    const { restaurantName, items, total, changeQuantity, removeItem, checkoutPending, beginCheckout, finishCheckout } = useCart();
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const headingRef = useRef(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        headingRef.current?.focus();
        return () => { mountedRef.current = false; };
    }, []);

    const submitOrder = async () => {
        const submission = beginCheckout();
        if (!submission) return;
        const sameSession = () => localStorage.getItem('token') === submission.token && localStorage.getItem('userId') === submission.userId;
        if (!sameSession()) {
            finishCheckout(submission);
            return;
        }
        setError('');
        try {
            const response = await apiFetch('/api/orders', {
                method: 'POST',
                body: JSON.stringify({
                    restaurantId: submission.cart.restaurantId,
                    items: submission.cart.items.map(({ product, quantity }) => ({ productId: product.id, quantity }))
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const requestError = new Error(data.error || 'Could not submit your order.');
                requestError.status = response.status;
                throw requestError;
            }

            const order = await response.json();
            if (!order.id) throw new Error('Order confirmation is missing.');
            if (sameSession()) {
                finishCheckout(submission, true);
                if (mountedRef.current) {
                    navigate('/orders', { replace: true, state: { orderUserId: submission.userId, orderConfirmation: `Order ${order.id} was placed successfully.` } });
                }
            }
        } catch (requestError) {
            if (mountedRef.current && sameSession()) {
                setError(requestError.status ? requestError.message : 'Could not confirm whether the order was placed. Check order history before trying again.');
            }
        } finally {
            finishCheckout(submission);
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
                                        <button type="button" disabled={checkoutPending} onClick={() => changeQuantity(product.id, -1)} aria-label={`Decrease ${product.name} quantity`}>−</button>
                                        <span>{quantity}</span>
                                        <button type="button" disabled={checkoutPending} onClick={() => changeQuantity(product.id, 1)} aria-label={`Increase ${product.name} quantity`}>+</button>
                                    </div>
                                    <button type="button" className="commerce-remove-btn" disabled={checkoutPending} onClick={() => removeItem(product.id)}>Remove</button>
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
                        <button type="button" className="commerce-primary-button" disabled={checkoutPending} onClick={submitOrder}>
                            {checkoutPending ? 'Placing order...' : 'Place order'}
                        </button>
                    </aside>
                </div>
            )}
        </main>
    );
}

export default CartPage;
