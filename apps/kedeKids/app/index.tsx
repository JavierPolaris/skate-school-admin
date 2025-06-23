import { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Pressable, StyleSheet, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { loginUser } from '@shared/api';
import { registerForPushNotificationsAndSave } from './utils/notifications';

import { API_URL } from '@shared/api';

export default function LoginScreen() {
  /* ---------------- state ---------------- */
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);

  const [showRequest, setShowRequest] = useState(false);
  const [reqName,  setReqName]  = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqMsg,   setReqMsg]   = useState('');

  /* ------------- auto-login ------------- */
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser  = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          goToRole(user.role);
        }
      } catch (e) {
        console.warn('❗️ Error leyendo AsyncStorage', e);
      }
    })();
  }, []);

  /* ------------- helpers ------------- */
  const goToRole = (role: string) => {
    if (role === 'admin')   router.replace('/admin');
    else                    router.replace('/student');
  };

  /* ------------- login handler ------------- */
  const handleLogin = async () => {
    console.log('🛰️  Intentando login con:', { email, password });

    try {
      const data = await loginUser(email.trim(), password);
      console.log('✅ Login OK, datos:', data);

      await AsyncStorage.multiSet([
        ['token', data.token],
        ['user',  JSON.stringify(data.user)],
      ]);

      // Registrar push token tras login exitoso
      await registerForPushNotificationsAndSave();

      goToRole(data.user.role);
    } catch (err: any) {
      console.error('❌ Error en loginUser:', err);
      setError(err.message || 'Error de autenticación');
    }
  };

  const handleRequestAccess = async () => {
    try {
      const res = await fetch(`${API_URL}/users/request-access`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ name: reqName, email: reqEmail }),
      });
      const data = await res.json();
      setReqMsg(res.ok
        ? '✅ Solicitud enviada. El equipo la revisará.'
        : data.error || 'Error al enviar la solicitud');
    } catch {
      setReqMsg('Error al conectar con el servidor.');
    }
  };

  /* ------------- render ------------- */
  return (
    <View style={styles.container}>
      {/* logo  */}
      <Image
        source={{ uri: 'https://www.kedekids.com/wp-content/uploads/2020/09/cropped-LOGO-KEDEKIDS-e1601394191149-1-2048x676.png' }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </Pressable>

      {/* -------- solicitud de acceso -------- */}
      <Pressable onPress={() => setShowRequest(true)}>
        <Text style={styles.link}>¿No tienes acceso? Solicitar acceso</Text>
      </Pressable>

      <Modal
        visible={showRequest}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRequest(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solicitud de acceso</Text>

            <TextInput
              placeholder="Nombre completo"
              style={styles.input}
              value={reqName}
              onChangeText={setReqName}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={reqEmail}
              onChangeText={setReqEmail}
            />

            {reqMsg ? <Text>{reqMsg}</Text> : null}

            <View style={styles.modalButtons}>
              <Pressable style={styles.buttonSmall} onPress={handleRequestAccess}>
                <Text style={styles.buttonText}>Enviar</Text>
              </Pressable>
              <Pressable style={styles.buttonSmallOutline} onPress={() => setShowRequest(false)}>
                <Text style={styles.buttonTextOutline}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------------- estilo ---------------- */
const styles = StyleSheet.create({
  container: {
    flex            : 1,
    justifyContent  : 'center',
    alignItems      : 'center',
    padding         : 24,
    backgroundColor : '#fff',
  },
  logo: { width: 200, height: 60, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  input: {
    width           : '100%',
    borderWidth     : 1,
    borderColor     : '#ccc',
    borderRadius    : 6,
    paddingVertical : 10,
    paddingHorizontal: 12,
    marginBottom    : 12,
  },
  button: {
    backgroundColor : '#000',
    paddingVertical : 12,
    paddingHorizontal: 32,
    borderRadius    : 6,
    marginTop       : 4,
    marginBottom    : 20,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: 'red', marginBottom: 8 },
  link : { color: '#0066cc', textDecorationLine: 'underline' },

  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  buttonSmall: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonSmallOutline: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonTextOutline: { color: '#000' },
});
