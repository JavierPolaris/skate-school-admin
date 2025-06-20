import { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Pressable, Alert, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import API_URL from '../constants/constants';
import { loginUser } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFCMToken from '../hooks/useFCMToken';

export default function HomePage({ onLogin }: { onLogin: (token: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');
    const [requestMessage, setRequestMessage] = useState('');

    const router = useRouter();
    const fcmToken = useFCMToken();


    useEffect(() => {
  const checkToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (err) {
      console.warn('Error accediendo a AsyncStorage:', err);
    }
  };

  checkToken();
}, []);

   useEffect(() => {
  const checkStoredUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') {
          router.replace('/app');
        } else if (user.role === 'student') {
          router.replace('/student-dashboard');
        }
      }
    } catch (err) {
      console.warn('Error al recuperar token o user:', err);
    }
  };

  checkStoredUser();
}, []);

const handleLogin = async () => {
  try {
    const data = await loginUser(email, password);
    console.log('✅ Login correcto:', data);

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    onLogin(data.token);

    // 👉 Guardar FCM token en la base de datos
    if (fcmToken) {
      console.log('📲 Enviando FCM token al backend:', fcmToken);

      await fetch(`${API_URL}/users/save-device-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.user.email, // o user._id si lo usas por ID
          deviceToken: fcmToken,
        }),
      });
    }

    // Redirección
    if (data.user.role === 'admin') {
      router.replace('/app');
    } else if (data.user.role === 'student') {
      router.replace('/student-dashboard');
    }
  } catch (err: any) {
    console.error('❌ Error al hacer login:', err);
    setError(err.message || 'Error al conectar con el servidor');
  }
};


    const handleRequestAccess = async () => {
        try {
            const response = await fetch(`${API_URL}/users/request-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: requestName, email: requestEmail }),
            });
            const data = await response.json();

            if (response.ok) {
                setRequestMessage('Solicitud enviada con éxito. El administrador revisará tu solicitud.');
            } else {
                setRequestMessage(data.error || 'Error al enviar la solicitud.');
            }
        } catch (err) {
            setRequestMessage('Error al conectar con el servidor.');
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{
                    uri: 'https://www.kedekids.com/wp-content/uploads/2020/09/cropped-LOGO-KEDEKIDS-e1601394191149-1-2048x676.png',
                }}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>Iniciar Sesión</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />

            <TextInput
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />

            <Pressable style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </Pressable>

            {error !== '' && <Text style={styles.error}>{error}</Text>}

            <Text style={{ marginTop: 20 }}>¿No tienes acceso?</Text>
            <Pressable onPress={() => setShowRequestModal(true)}>
                <Text style={styles.link}>Solicitar acceso</Text>
            </Pressable>

            <Modal visible={showRequestModal} animationType="slide">
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>Solicitud de Acceso</Text>
                    <TextInput
                        placeholder="Nombre completo"
                        value={requestName}
                        onChangeText={setRequestName}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Email"
                        value={requestEmail}
                        onChangeText={setRequestEmail}
                        style={styles.input}
                    />
                    <Pressable style={styles.button} onPress={handleRequestAccess}>
                        <Text style={styles.buttonText}>Enviar Solicitud</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowRequestModal(false)}>
                        <Text style={styles.link}>Cancelar</Text>
                    </Pressable>
                    {requestMessage !== '' && <Text>{requestMessage}</Text>}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    logo: {
        width: 200,
        height: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    input: {
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        padding: 10,
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#1D3047',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
    link: {
        color: '#007AFF',
        marginTop: 10,
    },
    modal: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 16,
    },
});
