// src/pages/RestaurantDetail.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../helper/api';
import { useCart } from '../context/CartContext';
import '../css/RestaurantDetail.css';

function RestaurantDetail() {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cartMessage, setCartMessage] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productLoading, setProductLoading] = useState(false);
    const [productError, setProductError] = useState('');
    const menuRequestRef = useRef(0);
    const productRequestRef = useRef(0);
    const { restaurantId: cartRestaurantId, items: cartItems, itemCount, total, addItem } = useCart();

    const fetchDetails = useCallback(async () => {
        const requestId = ++menuRequestRef.current;
        setLoading(true);
        setError('');
        try {
            const [restaurantResponse, productsResponse] = await Promise.all([
                apiFetch(`/api/restaurants/${id}`),
                apiFetch(`/api/restaurants/${id}/products`)
            ]);
            if (!restaurantResponse.ok) throw new Error('Restaurant not found.');
            if (!productsResponse.ok) throw new Error('Could not load the restaurant menu.');

            const [restaurantData, productsData] = await Promise.all([
                restaurantResponse.json(),
                productsResponse.json()
            ]);
            if (requestId === menuRequestRef.current) {
                setRestaurant(restaurantData);
                setProducts(Array.isArray(productsData) ? productsData : []);
            }
        } catch (requestError) {
            if (requestId === menuRequestRef.current) setError(requestError.message || 'Could not reach the server.');
        } finally {
            if (requestId === menuRequestRef.current) setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setSelectedProductId('');
        setSelectedProduct(null);
        setProductError('');
        setProductLoading(false);
        setCartMessage('');
        fetchDetails();
        return () => {
            menuRequestRef.current += 1;
            productRequestRef.current += 1;
        };
    }, [fetchDetails]);

    const openProduct = async (productId) => {
        const requestId = ++productRequestRef.current;
        setSelectedProductId(productId);
        setSelectedProduct(null);
        setProductLoading(true);
        setProductError('');
        try {
            const response = await apiFetch(`/api/restaurants/${encodeURIComponent(id)}/products/${encodeURIComponent(productId)}`);
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Could not load the dish.');
            }
            const data = await response.json();
            if (requestId === productRequestRef.current) setSelectedProduct(data);
        } catch (requestError) {
            if (requestId === productRequestRef.current) setProductError(requestError.message || 'Could not reach the server.');
        } finally {
            if (requestId === productRequestRef.current) setProductLoading(false);
        }
    };

    const closeProduct = () => {
        productRequestRef.current += 1;
        setSelectedProductId('');
        setSelectedProduct(null);
        setProductError('');
        setProductLoading(false);
    };

    const menuGroups = useMemo(() => {
        const groups = new Map();
        products.forEach((product) => {
            const category = product.category?.trim() || 'Menu';
            if (!groups.has(category)) groups.set(category, []);
            groups.get(category).push(product);
        });
        return Array.from(groups.entries());
    }, [products]);

    const handleAddToCart = (product) => {
        if (cartRestaurantId && cartRestaurantId !== id && cartItems.length > 0) {
            const shouldReplace = window.confirm(
                'Your cart contains items from another restaurant. Clear it and start a new cart?'
            );
            if (!shouldReplace) return;
        }
        addItem(restaurant, product);
        setCartMessage(`${product.name} added to your cart.`);
    };

    if (loading) {
        return (
            <main className="restaurant-detail-state" role="status">Loading restaurant menu...</main>
        );
    }

    if (error || !restaurant) {
        return (
            <main className="restaurant-detail-state">
                <h1>Restaurant unavailable</h1>
                <p>{error}</p>
                <Link to="/" className="restaurant-back-link">← Back to restaurants</Link>
            </main>
        );
    }

    return (
        <main className="restaurant-detail-page">
            <Link to="/" className="restaurant-back-link">← Back to restaurants</Link>

            <header className="restaurant-hero">
                {restaurant.picture ? (
                    <img className="restaurant-hero-image" src={restaurant.picture} alt={restaurant.name} />
                ) : (
                    <div className="restaurant-hero-placeholder" aria-hidden="true">🍽️</div>
                )}
                <div className="restaurant-hero-copy">
                    <div className="restaurant-hero-meta">
                        {restaurant.category && <span>{restaurant.category}</span>}
                        {restaurant.isPromoted && <span className="restaurant-promoted-tag">Promoted</span>}
                    </div>
                    <h1>{restaurant.name}</h1>
                    {restaurant.description && <p>{restaurant.description}</p>}
                    <div className="restaurant-details-meta">
                        {restaurant.address && <span>📍 {restaurant.address}</span>}
                        {restaurant.phone && <span>☎ {restaurant.phone}</span>}
                        {restaurant.deliveryTime && <span>🚴 {restaurant.deliveryTime}</span>}
                    </div>
                </div>
            </header>

            <div className="restaurant-menu-layout">
                <section className="restaurant-menu-content" aria-label="Restaurant menu">
                    <div className="restaurant-menu-heading">
                        <h2>Menu</h2>
                        <span>{products.length} {products.length === 1 ? 'item' : 'items'}</span>
                    </div>
                    {selectedProductId && (
                        <section className="menu-category" aria-label="Dish details">
                            <div className="restaurant-menu-heading">
                                <h3>Dish details</h3>
                                <button type="button" className="menu-add-button" onClick={closeProduct}>Close details</button>
                            </div>
                            {productLoading && <p role="status">Loading dish details...</p>}
                            {productError && (
                                <div role="alert">
                                    <p>{productError}</p>
                                    <button type="button" className="menu-add-button" onClick={() => openProduct(selectedProductId)}>Try again</button>
                                </div>
                            )}
                            {selectedProduct && (
                                <article className="menu-product">
                                    <div className="menu-product-copy">
                                        <h4>{selectedProduct.name}</h4>
                                        {selectedProduct.category && <p>{selectedProduct.category}</p>}
                                        {selectedProduct.description && <p>{selectedProduct.description}</p>}
                                        <strong>₪{Number(selectedProduct.price).toFixed(2)}</strong>
                                    </div>
                                    {selectedProduct.picture && <img src={selectedProduct.picture} alt={selectedProduct.name} className="menu-product-image" />}
                                    <button type="button" className="menu-add-button" onClick={() => handleAddToCart(selectedProduct)} aria-label={`Add ${selectedProduct.name} to cart`}>
                                        <span aria-hidden="true">+</span><span>Add</span>
                                    </button>
                                </article>
                            )}
                        </section>
                    )}
                    {products.length === 0 ? (
                        <div className="restaurant-menu-empty">
                            <h3>Menu coming soon</h3>
                            <p>This restaurant has not added menu items yet.</p>
                        </div>
                    ) : menuGroups.map(([category, categoryProducts]) => (
                        <section className="menu-category" key={category}>
                            <h3>{category}</h3>
                            <div className="menu-product-list">
                                {categoryProducts.map((product) => (
                                    <article className="menu-product" key={product.id}>
                                        <div className="menu-product-copy">
                                            <h4>{product.name}</h4>
                                            {product.description && <p>{product.description}</p>}
                                            <strong>₪{Number(product.price).toFixed(2)}</strong>
                                        </div>
                                        {product.picture && <img src={product.picture} alt={product.name} className="menu-product-image" />}
                                        <button type="button" className="menu-add-button" onClick={() => handleAddToCart(product)} aria-label={`Add ${product.name} to cart`}>
                                            <span aria-hidden="true">+</span><span>Add</span>
                                        </button>
                                        <button type="button" className="menu-add-button" onClick={() => openProduct(product.id)} aria-label={`View ${product.name} details`}>View details</button>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </section>

                <aside className="restaurant-cart-summary">
                    <div className="restaurant-cart-summary-heading">
                        <h2>Your order</h2>
                        <span>{itemCount}</span>
                    </div>
                    {cartRestaurantId === id && cartItems.length > 0 ? (
                        <>
                            <ul>
                                {cartItems.map(({ product, quantity }) => (
                                    <li key={product.id}>
                                        <span>{quantity} × {product.name}</span>
                                        <strong>₪{(Number(product.price) * quantity).toFixed(2)}</strong>
                                    </li>
                                ))}
                            </ul>
                            <div className="restaurant-cart-total"><span>Total</span><strong>₪{total.toFixed(2)}</strong></div>
                            <Link to="/cart" className="restaurant-view-cart">Review cart</Link>
                        </>
                    ) : (
                        <p className="restaurant-cart-empty">Add a dish to start your order.</p>
                    )}
                    {cartMessage && <p className="cart-live-message" role="status">{cartMessage}</p>}
                </aside>
            </div>
        </main>
    );
}

export default RestaurantDetail;

