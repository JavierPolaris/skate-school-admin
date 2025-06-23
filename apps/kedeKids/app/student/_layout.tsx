// app/student/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.apiUrl; // debe terminar en /api

export default function StudentLayout() {
  const router = useRouter();

  // Estado de notificaciones y mensajes
  const [messageCount, setMessageCount]       = useState(0);
  const [notifications, setNotifications]     = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Estado de búsqueda
  const [searchTerm, setSearchTerm]     = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Estado de usuario
  const [userData, setUserData] = useState<{ name: string; avatar: string }>({
    name: '',
    avatar: '',
  });

  // Refs para cerrar dropdowns al tocar fuera
  const notifRef = useRef(null);
  const menuRef  = useRef(null);

  // Carga inicial de datos: mensajes, avatar, notificaciones “dinámicas”
  useEffect(() => {
    // Cuenta de solicitudes de acceso (ejemplo)
    axios.get(`${API_URL}/users/requests`)
      .then(res => setMessageCount(res.data.length))
      .catch(() => setMessageCount(0));

    // Notificaciones simuladas según día
    const day = new Date().getDate();
    setNotifications(day >= 25 ? ['Comienza la fecha de pagos'] : []);

    // Datos de usuario
    AsyncStorage.getItem('user')
      .then(str => {
        if (str) setUserData(JSON.parse(str));
      })
      .catch(() => {});
  }, []);

  // Búsqueda dinámica
  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/users/search`, {
        params: { query: text },
      });
      const combined = [
        ...res.data.users.map((u: any) => ({ ...u, type: 'user' })),
        ...res.data.groups.map((g: any) => ({ ...g, type: 'group' })),
        ...res.data.events.map((e: any) => ({ ...e, type: 'event' })),
      ];
      setSearchResults(combined);
    } catch {
      setSearchResults([]);
    }
  };

  // Logout
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/login');
  };

  // Cerrar dropdowns al tocar fuera
  const handleOutsidePress = (e: any) => {
    // aquí podrías usar `notifRef.current` y `menuRef.current`
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  useEffect(() => {
    // listener global? en RN necesitarías un TouchableWithoutFeedback en la raíz
    // o definir en el Modal la prop onRequestClose
  }, []);

  // Estado para menú de usuario
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* ——— HEADER ——— */}
      <View style={styles.header}>
        {/* Hamburguesa para togglear sidebar (si tuvieras) */}
        <Pressable onPress={() => {/* toggleSidebar() */}} style={styles.iconBtn}>
          <MaterialIcons name="menu" size={24} />
        </Pressable>

        {/* Logo */}
        <Pressable
          onPress={() => router.replace('/student')}
          style={styles.logoContainer}
        >
          <Image
            source={{
              uri:
                'https://www.kedekids.com/wp-content/uploads/2020/09/cropped-LOGO-KEDEKIDS-e1601394191149-1-2048x676.png',
            }}
            style={styles.logo}
          />
        </Pressable>

        {/* Fecha y hora */}
        <View style={styles.dateTime}>
          <Text>{new Date().toLocaleDateString()}</Text>
          <Text>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        {/* Search */}
        <TextInput
          placeholder="Buscar..."
          value={searchTerm}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={searchResults}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    let dest = '/student';
                    if (item.type === 'user')  dest = `/app/students?userId=${item._id}`;
                    if (item.type === 'group') dest = `/app/groups?groupId=${item._id}`;
                    if (item.type === 'event') dest = `/app/events?eventId=${item._id}`;
                    router.push(dest);
                    setSearchResults([]);
                  }}
                >
                  <Text style={styles.searchItem}>
                    {item.type === 'user' && `Usuario: ${item.name}`}
                    {item.type === 'group' && `Grupo: ${item.name}`}
                    {item.type === 'event' && `Evento: ${item.name}`}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Iconos notificaciones y mensajes */}
        <Pressable
          ref={notifRef}
          onPress={() => setShowNotifications(!showNotifications)}
          style={styles.iconBtn}
        >
          <FontAwesome name="bell" size={24} />
          {notifications.length > 0 && <View style={styles.dot} />}
        </Pressable>
        {showNotifications && (
          <View style={styles.dropdown}>
            {notifications.map((n, i) => (
              <Text key={i}>{n}</Text>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => router.push('/app/requests')}
          style={styles.iconBtn}
        >
          <FontAwesome name="envelope" size={24} />
          {messageCount > 0 && (
            <View style={styles.msgCount}>
              <Text style={styles.msgCountText}>{messageCount}</Text>
            </View>
          )}
        </Pressable>

        {/* Menú de usuario */}
        <Pressable
          ref={menuRef}
          onPress={() => setShowUserMenu(!showUserMenu)}
          style={styles.userMenuBtn}
        >
          <Image
            source={{
              uri: userData.avatar.startsWith('http')
                ? userData.avatar
                : `${API_URL}/users/avatar/${userData.avatar}`,
            }}
            style={styles.avatar}
          />
          <FontAwesome5 name="caret-down" size={16} />
        </Pressable>
        {showUserMenu && (
          <View style={styles.dropdown}>
            <Pressable onPress={() => router.push('/change-password')}>
              <Text>Cambiar contraseña</Text>
            </Pressable>
            <Pressable onPress={handleLogout}>
              <Text style={{ color: 'red' }}>Cerrar sesión</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ——— CONTENIDO DE RUTAS HIJAS ——— */}
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection   : 'row',
    alignItems      : 'center',
    paddingHorizontal: 12,
    paddingVertical : 8,
    backgroundColor : '#fff',
    flexWrap        : 'wrap',
  },
  iconBtn: { marginHorizontal: 6 },
  logoContainer: { marginHorizontal: 8 },
  logo: { width: 80, height: 28, resizeMode: 'contain' },
  dateTime: { marginHorizontal: 8 },
  searchInput: {
    flex           : 1,
    borderWidth    : 1,
    borderColor    : '#ccc',
    borderRadius   : 6,
    paddingHorizontal: 8,
    height         : 32,
    marginHorizontal: 8,
  },
  searchResults: {
    position        : 'absolute',
    top             : 48,
    left            : 100,
    right           : 16,
    backgroundColor : '#fff',
    borderWidth     : 1,
    borderColor     : '#ddd',
    borderRadius    : 4,
    maxHeight       : 200,
    zIndex          : 10,
  },
  searchItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dot: {
    position    : 'absolute',
    top         : 2,
    right       : 2,
    width       : 6,
    height      : 6,
    borderRadius: 3,
    backgroundColor: 'red',
  },
  msgCount: {
    position    : 'absolute',
    top         : -4,
    right       : -4,
    backgroundColor: 'red',
    borderRadius    : 8,
    paddingHorizontal: 4,
  },
  msgCountText: { color: '#fff', fontSize: 10 },
  userMenuBtn: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 6 },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 4 },
  dropdown: {
    position        : 'absolute',
    top             : 48,
    right           : 12,
    backgroundColor : '#fff',
    borderWidth     : 1,
    borderColor     : '#ddd',
    borderRadius    : 4,
    padding         : 8,
    zIndex          : 20,
  },
});
