import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function StudentTricksScreen() {
  const [tricks, setTricks] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTricks = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        navigation.navigate('Login' as never);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'student') {
        navigation.navigate('Login' as never);
        return;
      }

      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tricks/by-student/${parsedUser._id}`);
        const data = await res.json();
        setTricks(data);
      } catch (err) {
        Alert.alert('Error', 'Hubo un problema al cargar los trucos.');
      }
    };

    fetchTricks();
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trucos Aprendidos</Text>

      {tricks.length ? (
        tricks.map((trick: any, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.trickName}>🛹 {trick.name}</Text>
            <Text style={styles.trickInfo}>Nivel: {trick.level}</Text>
            <Text style={styles.trickInfo}>Estado: {trick.status || 'Pendiente'}</Text>
          </View>
        ))
      ) : (
        <Text style={{ color: '#fff', textAlign: 'center' }}>Aún no has aprendido ningún truco.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0e0e0e',
  },
  title: {
    fontSize: 22,
    color: '#ff9b00',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  trickName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff9b00',
    marginBottom: 4,
  },
  trickInfo: {
    color: '#fff',
  },
});
