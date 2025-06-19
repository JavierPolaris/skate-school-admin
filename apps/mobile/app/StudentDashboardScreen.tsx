import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import {
  getGroupDetails,
  getUpcomingClasses,
  getGroupNotifications,
} from '@shared/api';

export default function StudentDashboardScreen() {
  const [user, setUser] = useState<any>({});
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
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

      const today = new Date();
      const day = today.getDate();
      if (day >= 1 && day <= 15) setShowPaymentReminder(true);

      if (parsedUser.groupId?._id) {
        try {
          const [group, classes, notifs] = await Promise.all([
            getGroupDetails(parsedUser.groupId._id),
            getUpcomingClasses(parsedUser.groupId._id),
            getGroupNotifications(parsedUser.groupId._id),
          ]);

          setGroupDetails(group);
          setUpcomingClasses(classes);
          setNotifications(notifs);
        } catch (err) {
          Alert.alert('Error', 'Hubo un problema al cargar los datos del dashboard.');
        }
      }
    };

    loadData();
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showPaymentReminder && (
        <View style={styles.reminderBox}>
          <Text style={styles.reminderText}>
            📢 ¡Recuerda realizar el pago de la matrícula antes del 15 de este mes!
          </Text>
        </View>
      )}

      <Text style={styles.title}>Bienvenido, {user.name}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Grupo Asignado</Text>
        <Text>{groupDetails?.name || 'Sin grupo asignado'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próximas Clases</Text>
        {upcomingClasses.length ? (
          upcomingClasses.map((cls: any, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text>📅 {new Date(cls.date).toLocaleDateString()}</Text>
              <Text>🕒 {cls.startTime || 'Hora no definida'}</Text>
              <Text>📍 {cls.place || 'Lugar no definido'}</Text>
            </View>
          ))
        ) : (
          <Text>No hay clases programadas.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimas Notificaciones</Text>
        {notifications.length ? (
          notifications.map((note: any, index: number) => (
            <Text key={index}>🔔 {note.message}</Text>
          ))
        ) : (
          <Text>No hay notificaciones recientes.</Text>
        )}
      </View>
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
  reminderBox: {
    backgroundColor: '#ff9b00',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  reminderText: {
    color: '#000',
    fontWeight: 'bold',
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
