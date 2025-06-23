import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* las rutas se registran automáticamente por nombre de archivo,
          aquí opcionalmente podrías ocultar header o animaciones pantalla a pantalla */}
      <Stack.Screen name="login" />
      <Stack.Screen name="admin/index" />
      <Stack.Screen name="student/index" />
    </Stack>
  );
}
