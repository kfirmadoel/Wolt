// app/index.js  (placeholder - Developer 2 builds the real screen here)

import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RestaurantsScreen() {
  const { userId } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurants</Text>
      <Text>Logged in as {userId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
});
