# 🪝 Documentación de Hooks del Sistema de Banners

## 📋 Índice
1. [useBannerStats](#usebannerstatslibhooksusebannerstatstsx)
2. [useAutomaticBanners](#useautomaticbanners)
3. [useProfile](#useprofile) 
4. [useChat](#usechat)

---

## `useBannerStats` (`/lib/hooks/useBannerStats.tsx`)

### 🎯 ¿Qué hace este hook?
Este hook es el "cerebro" del sistema de banners. Se encarga de:
- 📊 Leer las estadísticas del usuario desde la base de datos
- 🏆 Obtener la lista de banners que el usuario ha desbloqueado
- 📈 Calcular el progreso hacia nuevos banners
- 🔐 Manejar códigos secretos para banners exclusivos

### 📥 Datos que maneja:

#### `UserStats` - Estadísticas del usuario
```typescript
interface UserStats {
  messages_sent_total: number;        // Total mensajes enviados
  reactions_received_total: number;   // Total reacciones recibidas  
  hearts_total: number;               // Total ❤️ recibidos
  laughs_total: number;               // Total 😂 recibidos
  ideas_total: number;                // Total 💡 recibidos
  poops_total: number;                // Total 💩 recibidos
  streak_current_days: number;        // Días consecutivos activo
  streak_longest_days: number;        // Racha más larga de días
  last_message_at: string | null;     // Último mensaje enviado
}
```

#### `BannerProgress` - Progreso hacia un banner
```typescript
interface BannerProgress {
  current: number;      // Progreso actual (ej: 75)
  max: number;          // Progreso necesario (ej: 100)  
  unlocked: boolean;    // ¿Ya lo tiene?
  description: string;  // Texto explicativo
}
```

### 🔧 Funciones principales:

#### `getBannerProgress(bannerId: string)`
**¿Qué hace?** Calcula el progreso para un banner específico

**Ejemplo de uso:**
```javascript
const progress = getBannerProgress('leyenda');
// Resultado: { current: 75, max: 100, unlocked: false, description: "75/100 reacciones recibidas" }
```

**Banners que maneja:**
- `nuevo-h` - Primer mensaje (1 mensaje)
- `leyenda` - Muchas reacciones (100 reacciones)
- `goat` - Muchos corazones (50 ❤️)
- `payaso` - Muchas risas (20 😂)
- `brujo` - Muchas ideas (15 💡)
- `todo-terreno` - Equilibrio (5 de cada reacción)
- `modo-diablo` - Muy activo (200 mensajes)
- `constante` - Racha corta (7 días)
- `inmortal` - Racha larga (30 días)
- `corazon-oro` - Muchos ❤️ en un día (20 ❤️)
- `bello-cur` - Muchos ❤️ en una semana (25 ❤️)
- `misterioso` - Banner especial secreto

#### `redeemSecretCode(code: string)`
**¿Qué hace?** Canjea un código secreto por un banner exclusivo

**Ejemplo de uso:**
```javascript
const success = await redeemSecretCode('REY_DEL_TODO_2025');
if (success) {
  // ¡Banner desbloqueado!
}
```

### 🔄 Flujo de datos:

1. **Usuario entra** → Hook se activa
2. **Consulta base de datos** → Obtiene estadísticas y banners
3. **Procesa datos** → Calcula progresos
4. **Actualiza interfaz** → Componentes muestran información

### 💡 ¿Cuándo se actualiza?
- Cuando el usuario cambia (login/logout)
- Cuando se canjea un código secreto
- Cuando se recargan los datos manualmente

---

## `useAutomaticBanners`

### 🎯 ¿Qué hace este hook?
Calcula banners automáticos en tiempo real basándose en los mensajes del chat actual. A diferencia de `useBannerStats`, estos banners aparecen y desaparecen dinámicamente.

### 📥 Props que recibe:
```typescript
interface AutomaticBannersProps {
  messages: Message[];    // Lista de mensajes del chat
  currentUserId: string;  // ID del usuario actual
}
```

### 📊 Banners automáticos que calcula:

#### 🏆 "Número 1" 
- **Condición:** Ser quien más reacciones ha recibido
- **Cómo se calcula:** Suma todas las reacciones de tus mensajes

#### ❤️ "Corazón de Oro"
- **Condición:** Tener más ❤️ que otros en mensajes recientes
- **Cómo se calcula:** Solo cuenta los últimos 50 mensajes

#### 😂 "Rey de la Comedia"
- **Condición:** Tener más 😂 que otros
- **Cómo se calcula:** Suma todas las reacciones 😂

#### 💡 "Genio"
- **Condición:** Tener más 💡 que otros
- **Cómo se calcula:** Suma todas las reacciones 💡

#### 📝 "Escritor Compulsivo"
- **Condición:** Haber enviado más mensajes que otros
- **Cómo se calcula:** Cuenta mensajes en el chat actual

### 🔄 Flujo de datos:

1. **Mensajes cambian** → Hook recalcula automáticamente
2. **Analiza estadísticas** → Por cada usuario en el chat
3. **Determina ganadores** → Quien cumple cada condición
4. **Devuelve banners** → Solo los que aplican al usuario actual

### 💡 Optimización:
Usa `useMemo` para no recalcular si los mensajes no han cambiado.

---

## `useProfile`

### 🎯 ¿Qué hace este hook?
Maneja toda la información del perfil del usuario, incluyendo sus banners equipados.

### 📊 Datos que maneja:

#### Información del perfil:
- Avatar del usuario
- Nombre para mostrar
- Banners equipados (máximo 3)
- Configuraciones personales

### 🔧 Funciones principales:

#### Equipar/desequipar banners:
```javascript
const equipBanner = (bannerId) => {
  // Agrega un banner a los equipados (máximo 3)
};

const unequipBanner = (bannerId) => {
  // Quita un banner de los equipados
};
```

#### Actualizar perfil:
```javascript
const updateProfile = (newData) => {
  // Actualiza información del perfil
};
```

### 🔄 Integración con banners:
- Lee banners equipados de la base de datos
- Permite cambiar qué banners se muestran
- Sincroniza con `useBannerStats` para banners disponibles

---

## `useChat`

### 🎯 ¿Qué hace este hook?
Maneja toda la funcionalidad del chat en tiempo real.

### 📊 Datos que maneja:

#### Mensajes:
- Lista de mensajes en tiempo real
- Envío de nuevos mensajes
- Reacciones a mensajes

#### Usuarios:
- Lista de usuarios conectados
- Estados de actividad
- Información de banners para cada usuario

### 🔧 Funciones principales:

#### `sendMessage(content: string)`
```javascript
const sendMessage = async (content) => {
  // 1. Guarda mensaje en base de datos
  // 2. Trigger actualiza estadísticas automáticamente  
  // 3. Interfaz se actualiza en tiempo real
};
```

#### `addReaction(messageId: string, emoji: string)`
```javascript
const addReaction = async (messageId, emoji) => {
  // 1. Guarda reacción en base de datos
  // 2. Trigger actualiza estadísticas del autor
  // 3. Puede otorgar banners automáticamente
  // 4. Interfaz se actualiza
};
```

#### `subscribeToMessages()`
```javascript
// Se suscribe a cambios en tiempo real
// Cuando alguien envía mensaje → Aparece inmediatamente
// Cuando alguien reacciona → Se actualiza inmediatamente
```

### 🔄 Integración con banners:

1. **Mensaje enviado** → Trigger actualiza `user_stats`
2. **Reacción agregada** → Trigger actualiza estadísticas del autor
3. **Hook detecta cambios** → `useBannerStats` obtiene nuevos datos
4. **Banners automáticos** → `useAutomaticBanners` recalcula en tiempo real
5. **Interfaz actualizada** → Nuevos banners aparecen

### 🎯 Flujo completo de ejemplo:

```
Usuario envía mensaje "Hola!" 
    ↓
useChat.sendMessage() guarda en BD
    ↓  
Trigger update_user_stats_on_message() se ejecuta
    ↓
user_stats.messages_sent_total += 1
    ↓
useBannerStats detecta cambio y recarga datos
    ↓
Si messages_sent_total >= 200 → Trigger otorga banner "modo-diablo"
    ↓
useAutomaticBanners recalcula con nuevos mensajes
    ↓
Interfaz muestra nuevos banners automáticamente
```

---

## 🎓 Para Estudiantes: Conceptos Clave

### 1. **React Hooks**
Los hooks son funciones especiales que empiezan con "use" y permiten usar características de React en componentes funcionales.

### 2. **Estado (State)**
```javascript
const [loading, setLoading] = useState(true);
// loading = valor actual
// setLoading = función para cambiar el valor
```

### 3. **Efectos (Effects)**
```javascript
useEffect(() => {
  // Código que se ejecuta cuando algo cambia
}, [dependency]); // Se ejecuta cuando 'dependency' cambia
```

### 4. **Memoización**
```javascript
const expensiveCalculation = useMemo(() => {
  // Solo se recalcula si 'data' cambia
  return processData(data);
}, [data]);
```

### 5. **Tiempo Real con Supabase**
```javascript
supabase
  .from('messages')
  .on('INSERT', (payload) => {
    // Nuevo mensaje llegó → Actualizar interfaz
  })
  .subscribe();
```

### 🏆 Consejos para entender mejor:

1. **Sigue el flujo:** Usuario hace algo → Hook reacciona → Base de datos cambia → Interfaz se actualiza
2. **Lee los nombres:** `useBannerStats` claramente maneja estadísticas de banners
3. **Entiende las dependencias:** ¿Cuándo se ejecuta cada hook?
4. **Practica con console.log:** Agrega logs para ver qué datos fluyen
5. **Cambia una cosa a la vez:** Modifica un valor y ve qué pasa

---

## 🔍 Debugging: Cómo encontrar problemas

### 1. **Hook no se ejecuta:**
```javascript
console.log('Hook ejecutándose:', { user, loading });
```

### 2. **Datos incorrectos:**
```javascript
console.log('Datos de stats:', stats);
console.log('Banners del usuario:', userBanners);
```

### 3. **Progreso mal calculado:**
```javascript
console.log('Calculando progreso para:', bannerId);
console.log('Stats actuales:', stats);
console.log('Resultado:', progress);
```

### 4. **Banner automático no aparece:**
```javascript
console.log('Mensajes analizados:', messages.length);
console.log('Usuario actual:', currentUserId);  
console.log('Banners calculados:', automaticBanners);
```

¡Con esta documentación ya puedes entender cómo funciona cada hook del sistema! 🚀