import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function StudentPaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPayments = async () => {
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
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payments/by-student/${parsedUser._id}`);
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        Alert.alert('Error', 'Hubo un problema al cargar los pagos.');
      }
    };

    fetchPayments();
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historial de Pagos</Text>

      {payments.length ? (
        payments.map((pago: any, index) => (
          <View key={index} style={styles.card}>
            <Text>💰 {pago.amount}€</Text>
            <Text>📅 {new Date(pago.date).toLocaleDateString()}</Text>
            <Text>💳 {pago.method}</Text>
            <Text>🧾 {pago.notes || 'Sin notas'}</Text>
          </View>
        ))
      ) : (
        <Text style={{ color: '#fff', textAlign: 'center' }}>No hay pagos registrados.</Text>
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
});
