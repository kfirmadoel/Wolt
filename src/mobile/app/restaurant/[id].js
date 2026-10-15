import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, useSegments } from 'expo-router';
import CategoryFilter from '../../components/CategoryFilter';
import ProductCard from '../../components/ProductCard';
import LoadMessage from '../../components/LoadMessage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { getData } from '../../services/api';

export default function RestaurantScreen() {
  const { id, productId } = useLocalSearchParams();
  const segments = useSegments();
  const isActive = segments[0] === 'restaurant';
  const { token } = useAuth();
  const { colors } = useTheme();
  const { addItem, itemCount, total } = useCart();
  const styles = createStyles(colors);
  const listRef = useRef(null);
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [productVersion, setProductVersion] = useState(0);

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedProductId(typeof productId === 'string' ? productId : null);
  }, [id, productId]);

  useEffect(() => {
    let active = true;
    if (!isActive) return;
    const loadMenu = async () => {
      setLoading(true);
      setServerError('');
      setRestaurant(null);
      setProducts([]);
      try {
        const path = `/api/restaurants/${encodeURIComponent(id)}`;
        const details = await getData(path, token);
        const menu = await getData(`${path}/products`, token);
        if (active) {
          setRestaurant(details);
          setProducts(menu);
          setSelectedCategory((category) => menu.some((product) => product.category === category) ? category : null);
        }
      } catch (err) {
        if (active) setServerError(err.status === 404 ? 'Restaurant not found.' : 'Could not load the menu. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadMenu();
    return () => { active = false; };
  }, [id, token, reloadVersion, isActive]);

  useEffect(() => {
    let active = true;
    if (!isActive) return;
    setSelectedProduct(null);
    setProductError('');
    if (!selectedProductId) { setProductLoading(false); return; }
    setProductLoading(true);
    getData(`/api/restaurants/${encodeURIComponent(id)}/products/${encodeURIComponent(selectedProductId)}`, token)
      .then((data) => { if (active) setSelectedProduct(data); })
      .catch((err) => { if (active) setProductError(err.status === 404 ? 'Dish not found.' : 'Could not load this dish. Please try again.'); })
      .finally(() => { if (active) setProductLoading(false); });
    return () => { active = false; };
  }, [id, token, selectedProductId, productVersion, reloadVersion, isActive]);

  const openProduct = (product) => {
    setSelectedProductId(product.id);
    setProductVersion((value) => value + 1);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
  const filtered = selectedCategory === null ? products : products.filter((product) => product.category === selectedCategory);

  return (
    <FlatList
      ref={listRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filtered}
      keyExtractor={(item) => item.id}
      refreshing={loading}
      onRefresh={() => setReloadVersion((value) => value + 1)}
      renderItem={({ item }) => <ProductCard product={item} onPress={() => openProduct(item)} onAdd={() => addItem(restaurant, item)} />}
      ListHeaderComponent={
        <View>
          <TouchableOpacity onPress={goBack} style={styles.back}><Text style={styles.link}>Back to restaurants</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(token ? '/cart' : '/login')} style={styles.cartLink}>
            <Text style={styles.link}>View cart ({itemCount})</Text>
            <Text style={styles.link}>₪{total.toFixed(2)}</Text>
          </TouchableOpacity>
          {restaurant ? (
            <>
              {restaurant.picture ? <Image source={{ uri: restaurant.picture }} style={styles.image} /> : null}
              <Text style={styles.category}>{restaurant.category}</Text>
              <Text style={styles.title}>{restaurant.name}</Text>
              {restaurant.description ? <Text style={styles.description}>{restaurant.description}</Text> : null}
              {restaurant.address ? <Text style={styles.details}>{restaurant.address}</Text> : null}
              {restaurant.phone ? <Text style={styles.details}>{restaurant.phone}</Text> : null}
              {selectedProductId ? (
                <View style={styles.productDetails}>
                  <Text style={styles.heading}>Dish details</Text>
                  {selectedProduct ? <ProductCard product={selectedProduct} onAdd={() => addItem(restaurant, selectedProduct)} /> : <LoadMessage loading={productLoading} error={productError} onRetry={() => setProductVersion((value) => value + 1)} />}
                  <TouchableOpacity onPress={() => setSelectedProductId(null)} style={styles.back}><Text style={styles.link}>Close details</Text></TouchableOpacity>
                </View>
              ) : null}
              <Text style={styles.heading}>Menu</Text>
              {categories.length > 0 ? <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} /> : null}
            </>
          ) : null}
        </View>
      }
      ListEmptyComponent={<LoadMessage loading={loading} error={serverError} empty="No dishes available yet." onRetry={() => setReloadVersion((value) => value + 1)} />}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32 },
  back: { paddingVertical: 12, alignSelf: 'flex-start' },
  link: { color: colors.accentText, fontWeight: 'bold' },
  image: { height: 200, width: '100%', borderRadius: 16, backgroundColor: colors.selected },
  category: { color: colors.accentText, marginTop: 18, fontSize: 13, fontWeight: 'bold' },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  description: { color: colors.muted, lineHeight: 22, fontSize: 15, marginBottom: 8 },
  details: { color: colors.muted, lineHeight: 21, fontSize: 13 },
  heading: { color: colors.text, fontSize: 21, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  productDetails: { marginTop: 8 },
  cartLink: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 10, marginBottom: 18, backgroundColor: colors.selected },
});
