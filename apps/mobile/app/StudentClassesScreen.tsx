import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function StudentClassesScreen() {
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState<any>({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchClasses = async () => {
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

      setUser(parsedUser);

      if (parsedUser.groupId?._id) {
        try {
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/groups/upcoming-classes/${parsedUser.groupId._id}`);
          const data = await res.json();
          setClasses(data);
        } catch (err) {
          Alert.alert('Error', 'Hubo un problema al cargar las clases.');
        }
      }
    };

    fetchClasses();
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Próximas Clases</Text>

      {classes.length ? (
        classes.map((cls: any, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>Clase {index + 1}</Text>
            <Text>📅 {new Date(cls.date).toLocaleDateString()}</Text>
            <Text>🕒 {cls.startTime || 'Hora no definida'}</Text>
            <Text>📍 {cls.place || 'Lugar no definido'}</Text>
          </View>
        ))
      ) : (
        <Text style={{ color: '#fff', textAlign: 'center' }}>No hay clases programadas.</Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff9b00',
    marginBottom: 8,
  },
});
