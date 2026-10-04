import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../helper/api';

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const readImageFile = (file, setImage, setMessage) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setMessage('Choose a PNG, JPEG, or WebP image.');
        return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
        setMessage('Restaurant image must be 3 MB or smaller.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        setImage(typeof reader.result === 'string' ? reader.result : '');
        setMessage('');
    };
    reader.onerror = () => setMessage('Could not read the selected image.');
    reader.readAsDataURL(file);
};

function RestaurantOwnerManager({ user }) {
    const [categories, setCategories] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [menuFeedback, setMenuFeedback] = useState(null);
    const [products, setProducts] = useState([]);
    const [productLoading, setProductLoading] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(false);
    const [restaurantForm, setRestaurantForm] = useState(null);
    const [replacementPicture, setReplacementPicture] = useState('');
    const [savingRestaurant, setSavingRestaurant] = useState(false);
    const [creatingRestaurant, setCreatingRestaurant] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        category: '',
        isPromoted: '',
        latitude: user.location?.x === undefined ? '' : String(user.location.x),
        longitude: user.location?.y === undefined ? '' : String(user.location.y)
    });
    const [newRestaurantPicture, setNewRestaurantPicture] = useState('');
    const [productForm, setProductForm] = useState({ name: '', description: '', price: '' });
    const [editingProductId, setEditingProductId] = useState('');
    const [savingProduct, setSavingProduct] = useState(false);

    const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) || null;

    const loadOwnedRestaurants = useCallback(async () => {
        const response = await apiFetch('/api/restaurants/mine');
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Could not load your restaurants.');
        }
        const data = await response.json();
        const ownedRestaurants = Array.isArray(data) ? data : [];
        setRestaurants(ownedRestaurants);
        return ownedRestaurants;
    }, []);

    const loadProducts = useCallback(async (restaurantId) => {
        const response = await apiFetch(`/api/restaurants/${restaurantId}/products`);
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Could not load the restaurant menu.');
        }
        const data = await response.json();
        const restaurantProducts = Array.isArray(data) ? data : [];
        setProducts(restaurantProducts);
        return restaurantProducts;
    }, []);

    useEffect(() => {
        let active = true;
        const loadManagerData = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const [categoryResponse, ownedRestaurants] = await Promise.all([
                    apiFetch('/api/restaurants/categories'),
                    loadOwnedRestaurants()
                ]);
                if (!categoryResponse.ok) {
                    const data = await categoryResponse.json().catch(() => ({}));
                    throw new Error(data.error || 'Could not load restaurant categories.');
                }
                const availableCategories = await categoryResponse.json();
                if (active) {
                    setCategories(availableCategories);
                    setNewRestaurant((current) => ({
                        ...current,
                        category: current.category || availableCategories[0] || ''
                    }));
                    if (ownedRestaurants.length > 0) {
                        setSelectedRestaurantId(ownedRestaurants[0].id);
                    }
                }
            } catch (error) {
                if (active) setLoadError(error.message);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadManagerData();
        return () => { active = false; };
    }, [loadOwnedRestaurants]);

    useEffect(() => {
        if (!selectedRestaurant) {
            setRestaurantForm(null);
            setProducts([]);
            setEditingRestaurant(false);
            return;
        }

        setRestaurantForm({
            name: selectedRestaurant.name || '',
            description: selectedRestaurant.description || '',
            address: selectedRestaurant.address || '',
            phone: selectedRestaurant.phone || '',
            category: selectedRestaurant.category || '',
            isPromoted: Boolean(selectedRestaurant.isPromoted),
            latitude: selectedRestaurant.location?.x === undefined ? '' : String(selectedRestaurant.location.x),
            longitude: selectedRestaurant.location?.y === undefined ? '' : String(selectedRestaurant.location.y)
        });
        setReplacementPicture('');
        setEditingRestaurant(false);
    }, [selectedRestaurant]);

    useEffect(() => {
        if (!selectedRestaurantId) {
            setProducts([]);
            return undefined;
        }

        let active = true;
        setProductLoading(true);
        setMenuFeedback(null);
        loadProducts(selectedRestaurantId)
            .catch((error) => {
                if (active) setMenuFeedback({ type: 'error', message: error.message });
            })
            .finally(() => {
                if (active) setProductLoading(false);
            });
        return () => { active = false; };
    }, [selectedRestaurantId, loadProducts]);

    const updateNewRestaurant = (field, value) => {
        setNewRestaurant((current) => ({ ...current, [field]: value }));
    };

    const updateRestaurantForm = (field, value) => {
        setRestaurantForm((current) => ({ ...current, [field]: value }));
    };

    const handleCreateRestaurant = async (event) => {
        event.preventDefault();
        setFeedback(null);
        const latitude = Number(newRestaurant.latitude);
        const longitude = Number(newRestaurant.longitude);

        if (!newRestaurant.name.trim() || !categories.includes(newRestaurant.category) ||
            !['true', 'false'].includes(newRestaurant.isPromoted) || !newRestaurantPicture) {
            setFeedback({ type: 'error', message: 'Complete the required fields, choose promotion status, and upload a restaurant image.' });
            return;
        }
        if (newRestaurant.phone && !/^\d+$/.test(newRestaurant.phone)) {
            setFeedback({ type: 'error', message: 'Phone number must contain digits only.' });
            return;
        }
        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
            !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
            setFeedback({ type: 'error', message: 'Enter valid restaurant coordinates.' });
            return;
        }

        setCreatingRestaurant(true);
        try {
            const response = await apiFetch('/api/restaurants', {
                method: 'POST',
                body: JSON.stringify({
                    name: newRestaurant.name.trim(),
                    description: newRestaurant.description.trim(),
                    address: newRestaurant.address.trim(),
                    phone: newRestaurant.phone,
                    category: newRestaurant.category,
                    isPromoted: newRestaurant.isPromoted === 'true',
                    picture: newRestaurantPicture,
                    location: { x: latitude, y: longitude }
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Restaurant creation failed.');
            }

            const newId = response.headers.get('Location')?.split('/').pop();
            const ownedRestaurants = await loadOwnedRestaurants();
            setSelectedRestaurantId(newId || ownedRestaurants[0]?.id || '');
            setNewRestaurant((current) => ({
                ...current,
                name: '', description: '', address: '', phone: '', isPromoted: ''
            }));
            setNewRestaurantPicture('');
            setFeedback({ type: 'success', message: 'Restaurant created. Select it above to manage its menu.' });
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Could not reach the server.' });
        } finally {
            setCreatingRestaurant(false);
        }
    };

    const handleSaveRestaurant = async (event) => {
        event.preventDefault();
        if (!selectedRestaurant || !restaurantForm) return;
        setFeedback(null);
        const latitude = Number(restaurantForm.latitude);
        const longitude = Number(restaurantForm.longitude);
        if (!restaurantForm.name.trim() || !categories.includes(restaurantForm.category)) {
            setFeedback({ type: 'error', message: 'Enter a restaurant name and choose an available category.' });
            return;
        }
        if (restaurantForm.phone && !/^\d+$/.test(restaurantForm.phone)) {
            setFeedback({ type: 'error', message: 'Phone number must contain digits only.' });
            return;
        }
        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
            !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
            setFeedback({ type: 'error', message: 'Enter valid restaurant coordinates.' });
            return;
        }

        setSavingRestaurant(true);
        try {
            const payload = {
                name: restaurantForm.name.trim(),
                description: restaurantForm.description.trim(),
                address: restaurantForm.address.trim(),
                phone: restaurantForm.phone,
                category: restaurantForm.category,
                isPromoted: restaurantForm.isPromoted,
                location: { x: latitude, y: longitude }
            };
            if (replacementPicture) payload.picture = replacementPicture;

            const response = await apiFetch(`/api/restaurants/${selectedRestaurant.id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Restaurant update failed.');
            }

            setRestaurants((current) => current.map((restaurant) => (
                restaurant.id === selectedRestaurant.id
                    ? { ...restaurant, ...payload, picture: replacementPicture || restaurant.picture }
                    : restaurant
            )));
            setEditingRestaurant(false);
            setReplacementPicture('');
            setFeedback({ type: 'success', message: 'Restaurant details updated.' });
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Could not reach the server.' });
        } finally {
            setSavingRestaurant(false);
        }
    };

    const handleDeleteRestaurant = async () => {
        if (!selectedRestaurant || !window.confirm(`Delete ${selectedRestaurant.name} and its menu?`)) return;
        setFeedback(null);
        try {
            const response = await apiFetch(`/api/restaurants/${selectedRestaurant.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Restaurant deletion failed.');
            }
            const remainingRestaurants = restaurants.filter((restaurant) => restaurant.id !== selectedRestaurant.id);
            setRestaurants(remainingRestaurants);
            setSelectedRestaurantId(remainingRestaurants[0]?.id || '');
            setFeedback({ type: 'success', message: 'Restaurant and its menu deleted.' });
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Could not reach the server.' });
        }
    };

    const handleProductSubmit = async (event) => {
        event.preventDefault();
        if (!selectedRestaurant) return;
        setMenuFeedback(null);
        const price = Number(productForm.price);
        if (!productForm.name.trim() || !Number.isFinite(price) || price <= 0) {
            setMenuFeedback({ type: 'error', message: 'Enter a product name and a price greater than zero.' });
            return;
        }

        setSavingProduct(true);
        try {
            const path = editingProductId
                ? `/api/restaurants/${selectedRestaurant.id}/products/${editingProductId}`
                : `/api/restaurants/${selectedRestaurant.id}/products`;
            const response = await apiFetch(path, {
                method: editingProductId ? 'PATCH' : 'POST',
                body: JSON.stringify({ name: productForm.name.trim(), description: productForm.description.trim(), price })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Menu item could not be saved.');
            }
            await loadProducts(selectedRestaurant.id);
            setProductForm({ name: '', description: '', price: '' });
            setEditingProductId('');
            setMenuFeedback({ type: 'success', message: editingProductId ? 'Menu item updated.' : 'Menu item added.' });
        } catch (error) {
            setMenuFeedback({ type: 'error', message: error.message || 'Could not reach the server.' });
        } finally {
            setSavingProduct(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProductId(product.id);
        setProductForm({ name: product.name, description: product.description || '', price: String(product.price) });
        setMenuFeedback(null);
    };

    const handleDeleteProduct = async (product) => {
        if (!selectedRestaurant || !window.confirm(`Delete ${product.name} from the menu?`)) return;
        setMenuFeedback(null);
        try {
            const response = await apiFetch(`/api/restaurants/${selectedRestaurant.id}/products/${product.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Menu item could not be deleted.');
            }
            setProducts((current) => current.filter((item) => item.id !== product.id));
            if (editingProductId === product.id) {
                setEditingProductId('');
                setProductForm({ name: '', description: '', price: '' });
            }
            setMenuFeedback({ type: 'success', message: 'Menu item deleted.' });
        } catch (error) {
            setMenuFeedback({ type: 'error', message: error.message || 'Could not reach the server.' });
        }
    };

    const renderCategoryOptions = () => categories.map((category) => (
        <option key={category} value={category}>{category}</option>
    ));

    return (
        <>
            <section className="profile-section-card owner-restaurants-section">
                <h3><span aria-hidden="true">🍽️</span><span>My Restaurants</span></h3>
                <p className="profile-section-desc">Choose a restaurant to edit its details or manage its menu.</p>
                {loading ? <p className="owner-empty-state">Loading restaurants...</p> : null}
                {loadError && <div className="profile-feedback error" role="alert">{loadError}</div>}
                {!loading && !loadError && restaurants.length === 0 && (
                    <p className="owner-empty-state">You have not created any restaurants yet.</p>
                )}
                {restaurants.length > 0 && (
                    <div className="owner-restaurant-list">
                        {restaurants.map((restaurant) => (
                            <button
                                key={restaurant.id}
                                type="button"
                                className={`owner-restaurant-option ${restaurant.id === selectedRestaurantId ? 'selected' : ''}`}
                                onClick={() => setSelectedRestaurantId(restaurant.id)}
                                aria-pressed={restaurant.id === selectedRestaurantId}
                            >
                                {restaurant.picture ? <img src={restaurant.picture} alt="" /> : <span aria-hidden="true">🍽️</span>}
                                <span>{restaurant.name}</span>
                                <small>{restaurant.category}</small>
                            </button>
                        ))}
                    </div>
                )}

                {selectedRestaurant && restaurantForm && (
                    <div className="owner-selected-restaurant">
                        <div className="owner-selected-heading">
                            <h4>{selectedRestaurant.name}</h4>
                            <Link to={`/restaurant/${selectedRestaurant.id}`} className="owner-view-link">View restaurant</Link>
                        </div>
                        {!editingRestaurant ? (
                            <div className="owner-action-row">
                                <button type="button" className="owner-secondary-btn" onClick={() => setEditingRestaurant(true)}>Edit restaurant</button>
                                <button type="button" className="owner-danger-btn" onClick={handleDeleteRestaurant}>Delete restaurant</button>
                            </div>
                        ) : (
                            <form className="owner-form-grid" onSubmit={handleSaveRestaurant}>
                                <label className="location-input-group owner-wide-field"><span>Name *</span><input className="restaurant-form-control" value={restaurantForm.name} onChange={(event) => updateRestaurantForm('name', event.target.value)} required /></label>
                                <label className="location-input-group"><span>Category *</span><select className="restaurant-form-control" value={restaurantForm.category} onChange={(event) => updateRestaurantForm('category', event.target.value)} required>{renderCategoryOptions()}</select></label>
                                <label className="location-input-group"><span>Promotion *</span><select className="restaurant-form-control" value={String(restaurantForm.isPromoted)} onChange={(event) => updateRestaurantForm('isPromoted', event.target.value === 'true')}><option value="false">Not promoted</option><option value="true">Promoted</option></select></label>
                                <label className="location-input-group owner-wide-field"><span>Description</span><textarea className="restaurant-form-control" rows="3" value={restaurantForm.description} onChange={(event) => updateRestaurantForm('description', event.target.value)} /></label>
                                <label className="location-input-group"><span>Address</span><input className="restaurant-form-control" value={restaurantForm.address} onChange={(event) => updateRestaurantForm('address', event.target.value)} /></label>
                                <label className="location-input-group"><span>Phone</span><input className="restaurant-form-control" type="tel" inputMode="numeric" pattern="[0-9]*" value={restaurantForm.phone} onChange={(event) => updateRestaurantForm('phone', event.target.value.replace(/\D/g, ''))} /></label>
                                <label className="location-input-group"><span>Latitude *</span><input className="restaurant-form-control" type="number" min="-90" max="90" step="any" value={restaurantForm.latitude} onChange={(event) => updateRestaurantForm('latitude', event.target.value)} required /></label>
                                <label className="location-input-group"><span>Longitude *</span><input className="restaurant-form-control" type="number" min="-180" max="180" step="any" value={restaurantForm.longitude} onChange={(event) => updateRestaurantForm('longitude', event.target.value)} required /></label>
                                <label className="location-input-group owner-wide-field"><span>Replace restaurant image</span><input className="restaurant-form-control" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImageFile(event.target.files[0], setReplacementPicture, (message) => setFeedback(message ? { type: 'error', message } : null))} /></label>
                                {(replacementPicture || selectedRestaurant.picture) && <img className="owner-image-preview owner-wide-field" src={replacementPicture || selectedRestaurant.picture} alt="Restaurant preview" />}
                                <div className="owner-action-row owner-wide-field">
                                    <button className="profile-save-btn" type="submit" disabled={savingRestaurant}>{savingRestaurant ? 'Saving...' : 'Save changes'}</button>
                                    <button className="owner-secondary-btn" type="button" onClick={() => setEditingRestaurant(false)}>Cancel</button>
                                </div>
                            </form>
                        )}
                        {feedback && <div className={`profile-feedback ${feedback.type}`} role="status">{feedback.message}</div>}

                        {editingRestaurant && <div className="owner-menu-section">
                            <h4>Menu</h4>
                            {productLoading ? <p className="owner-empty-state">Loading menu...</p> : null}
                            {menuFeedback && <div className={`profile-feedback ${menuFeedback.type}`} role="status">{menuFeedback.message}</div>}
                            {!productLoading && products.length === 0 && <p className="owner-empty-state">No menu items yet. Add the first item below.</p>}
                            {products.length > 0 && (
                                <div className="owner-menu-list">
                                    {products.map((product) => (
                                        <div className="owner-menu-item" key={product.id}>
                                            <div><strong>{product.name}</strong><span>₪{product.price}</span>{product.description && <p>{product.description}</p>}</div>
                                            <div className="owner-menu-actions">
                                                <button type="button" className="owner-secondary-btn" onClick={() => handleEditProduct(product)}>Edit</button>
                                                <button type="button" className="owner-danger-btn" onClick={() => handleDeleteProduct(product)}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <form className="owner-product-form" onSubmit={handleProductSubmit}>
                                <h5>{editingProductId ? 'Edit menu item' : 'Add menu item'}</h5>
                                <label className="location-input-group"><span>Name *</span><input className="restaurant-form-control" value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                                <label className="location-input-group"><span>Description</span><textarea className="restaurant-form-control" rows="2" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} /></label>
                                <label className="location-input-group"><span>Price (₪) *</span><input className="restaurant-form-control" type="number" min="0.01" step="0.01" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} required /></label>
                                <div className="owner-action-row">
                                    <button className="profile-save-btn" type="submit" disabled={savingProduct}>{savingProduct ? 'Saving...' : editingProductId ? 'Save item' : 'Add item'}</button>
                                    {editingProductId && <button className="owner-secondary-btn" type="button" onClick={() => { setEditingProductId(''); setProductForm({ name: '', description: '', price: '' }); }}>Cancel</button>}
                                </div>
                            </form>
                        </div>}
                    </div>
                )}
            </section>

            <section className="profile-section-card">
                <h3><span aria-hidden="true">＋</span><span>Create a Restaurant</span></h3>
                <p className="profile-section-desc">Upload the restaurant's image and complete its location to publish it.</p>
                <form className="restaurant-create-form" onSubmit={handleCreateRestaurant}>
                    <label className="location-input-group"><span>Restaurant name *</span><input className="restaurant-form-control" value={newRestaurant.name} onChange={(event) => updateNewRestaurant('name', event.target.value)} required /></label>
                    <label className="location-input-group"><span>Category *</span><select className="restaurant-form-control" value={newRestaurant.category} onChange={(event) => updateNewRestaurant('category', event.target.value)} required disabled={categories.length === 0}>{renderCategoryOptions()}</select></label>
                    <label className="location-input-group"><span>Promotion *</span><select className="restaurant-form-control" value={newRestaurant.isPromoted} onChange={(event) => updateNewRestaurant('isPromoted', event.target.value)} required><option value="" disabled>Select promotion status</option><option value="false">Not promoted</option><option value="true">Promoted</option></select></label>
                    <label className="location-input-group"><span>Description</span><textarea className="restaurant-form-control" value={newRestaurant.description} onChange={(event) => updateNewRestaurant('description', event.target.value)} rows="3" /></label>
                    <label className="location-input-group"><span>Address</span><input className="restaurant-form-control" value={newRestaurant.address} onChange={(event) => updateNewRestaurant('address', event.target.value)} /></label>
                    <label className="location-input-group"><span>Phone</span><input className="restaurant-form-control" type="tel" inputMode="numeric" pattern="[0-9]*" value={newRestaurant.phone} onChange={(event) => updateNewRestaurant('phone', event.target.value.replace(/\D/g, ''))} /></label>
                    <div className="location-inputs-row">
                        <label className="location-input-group"><span>Restaurant latitude *</span><input className="restaurant-form-control" type="number" min="-90" max="90" step="any" value={newRestaurant.latitude} onChange={(event) => updateNewRestaurant('latitude', event.target.value)} required /></label>
                        <label className="location-input-group"><span>Restaurant longitude *</span><input className="restaurant-form-control" type="number" min="-180" max="180" step="any" value={newRestaurant.longitude} onChange={(event) => updateNewRestaurant('longitude', event.target.value)} required /></label>
                    </div>
                    <p className="location-hint">Coordinates are prefilled from your profile, but can be changed to the restaurant's location.</p>
                    <label className="location-input-group"><span>Restaurant image * (PNG, JPEG, WebP; up to 3 MB)</span><input className="restaurant-form-control" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImageFile(event.target.files[0], setNewRestaurantPicture, (message) => setFeedback(message ? { type: 'error', message } : null))} required /></label>
                    {newRestaurantPicture && <img className="owner-image-preview" src={newRestaurantPicture} alt="Restaurant preview" />}
                    <button className="profile-save-btn" type="submit" disabled={creatingRestaurant || categories.length === 0}>{creatingRestaurant ? 'Creating...' : 'Create restaurant'}</button>
                    {feedback && <div className={`profile-feedback ${feedback.type}`} role="status">{feedback.message}</div>}
                </form>
            </section>
        </>
    );
}

export default RestaurantOwnerManager;