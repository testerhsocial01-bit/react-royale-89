# 📚 Documentación del Sistema de Banners

## 🎯 ¿Qué es este proyecto?

Este es un sistema de chat con banners inteligentes que recompensa a los usuarios por su actividad. Los usuarios pueden ganar banners (como medallas virtuales) enviando mensajes, recibiendo reacciones y completando misiones especiales.

## 🏗️ Arquitectura General

```
Base de Datos (Supabase)
    ↓
Triggers Automáticos (SQL)
    ↓
Hooks de React (JavaScript)
    ↓
Componentes de Interfaz
    ↓
Usuario ve banners en chat y perfil
```

## 📁 Estructura de Archivos Principales

### 🪝 Hooks (Ganchos de React)
- **`useBannerStats.tsx`** - Lee estadísticas de la base de datos y maneja banners permanentes
- **`useAutomaticBanners.tsx`** - Calcula banners automáticos en tiempo real basado en mensajes
- **`useProfile.tsx`** - Maneja el perfil del usuario y sus banners equipados
- **`useChat.tsx`** - Funcionalidad principal del chat

### 🧩 Componentes de Interfaz
- **`Banners.tsx`** - Página donde se ven todos los banners disponibles
- **`BannerCard.tsx`** - Tarjeta individual que muestra un banner
- **`ChatAppV2.tsx`** - La aplicación principal del chat
- **`MessageBubbleV2.tsx`** - Cada mensaje individual en el chat
- **`UserBanner.tsx`** - Cómo se ve un banner al lado del nombre

### 📊 Datos
- **`bannerData.ts`** - Lista completa de todos los banners disponibles

## 🎖️ Tipos de Banners

### 1. ⚡ Banners Automáticos
- **¿Qué son?** Se activan automáticamente mientras cumples la condición
- **¿Cuándo aparecen?** En tiempo real mientras chateas
- **¿Cuándo desaparecen?** Cuando dejas de cumplir la condición
- **Ejemplos:**
  - 👑 "Número 1" - Eres quien más reacciones ha recibido hoy
  - ❤️ "Corazón de Oro" - Eres quien más ❤️ ha recibido en los últimos mensajes

### 2. 🏆 Banners por Misiones (Permanentes)
- **¿Qué son?** Los desbloqueas permanentemente al completar objetivos
- **¿Cuándo aparecen?** Una vez desbloqueados, los puedes equipar en tu perfil
- **¿Cuántos puedo usar?** Máximo 3 a la vez
- **Ejemplos:**
  - 🆕 "Nuevo H" - Enviar tu primer mensaje
  - 🏆 "Leyenda" - Recibir 100 reacciones en total

### 3. 👑 Banners Exclusivos
- **¿Qué son?** Los más raros y especiales
- **¿Cómo conseguirlos?** Códigos secretos o eventos especiales
- **¿Qué tienen especial?** Pueden tener animaciones y efectos visuales
- **Ejemplo:**
  - 👑🔥 "Fundador y Rey del Todo" - Código secreto: `REY_DEL_TODO_2025`

## 🔄 Flujo de Datos: ¿Cómo Funciona Todo?

### Cuando un usuario envía un mensaje:

1. **📝 Usuario escribe mensaje** → Se guarda en la base de datos
2. **⚡ Trigger automático** → Se actualiza la tabla `user_stats`
3. **📊 Hook lee estadísticas** → `useBannerStats` obtiene los números actualizados
4. **🎯 Se calculan banners** → `useAutomaticBanners` determina qué banners mostrar
5. **🎨 Se actualiza interfaz** → Los componentes muestran los banners nuevos

### Cuando alguien reacciona a un mensaje:

1. **😄 Usuario hace clic en reacción** → Se guarda la reacción
2. **⚡ Trigger automático** → Se actualiza `user_stats` del autor del mensaje
3. **🏆 Se verifica banner** → Si cumple condiciones, se otorga banner permanente
4. **🎨 Se actualiza interfaz** → Nuevos banners aparecen inmediatamente

## 🗃️ Base de Datos: Tablas Importantes

### `user_stats` - Estadísticas de cada usuario
```sql
- user_id: ID del usuario
- messages_sent_total: Total de mensajes enviados
- reactions_received_total: Total de reacciones recibidas
- hearts_total: Total de ❤️ recibidos
- laughs_total: Total de 😂 recibidos
- ideas_total: Total de 💡 recibidos
- streak_current_days: Días consecutivos activo
- last_message_at: Último mensaje enviado
```

### `user_banners` - Banners desbloqueados
```sql
- user_id: ID del usuario
- banner_id: ID del banner desbloqueado
- unlocked_at: Cuándo se desbloqueó
```

### `banners` - Información de todos los banners
```sql
- id: Identificador único (ej: 'nuevo-h', 'leyenda')
- name: Nombre mostrado
- emoji: Icono del banner
- description: Descripción de qué hace
- rarity: Rareza (common, rare, epic, legendary)
```

## 🛠️ Triggers Automáticos de Base de Datos

Los triggers son funciones que se ejecutan automáticamente cuando algo cambia en la base de datos:

### 1. `update_user_stats_on_message()` 
- **¿Cuándo?** Cada vez que se envía un mensaje
- **¿Qué hace?** Actualiza el contador de mensajes y la fecha del último mensaje

### 2. `update_user_stats_on_reaction()`
- **¿Cuándo?** Cada vez que alguien reacciona a un mensaje  
- **¿Qué hace?** Actualiza los contadores de reacciones del autor del mensaje

### 3. `award_banner_on_milestone()`
- **¿Cuándo?** Después de actualizar estadísticas
- **¿Qué hace?** Verifica si el usuario merece un nuevo banner y se lo otorga

## 🔍 Cómo Leer el Código

### 1. Hooks de React
```javascript
// Un hook es una función que empieza con "use"
const { stats, userBanners } = useBannerStats();

// Esto significa: "Dame las estadísticas y banners del usuario actual"
```

### 2. Estados de React
```javascript
const [loading, setLoading] = useState(true);

// loading = variable que guarda si está cargando
// setLoading = función para cambiar el valor de loading
// useState(true) = valor inicial es "true"
```

### 3. Efectos de React
```javascript
useEffect(() => {
    // Este código se ejecuta cuando cambia algo
}, [user]); // Se ejecuta cuando cambia 'user'
```

## 📈 Métricas y Progreso

### ¿Cómo se calcula el progreso de un banner?

```javascript
// Ejemplo: Banner "Leyenda" requiere 100 reacciones
{
  current: 75,     // Usuario tiene 75 reacciones
  max: 100,        // Necesita 100 para desbloquear
  unlocked: false, // Aún no lo tiene
  description: "75/100 reacciones recibidas"
}
```

## 🎨 Interfaz de Usuario

### Dónde aparecen los banners:

1. **En el chat** - Al lado del nombre de usuario
2. **En el perfil** - Lista de banners equipados
3. **En página de banners** - Colección completa con progreso

### Colores y estilos por rareza:

- **Común (common)** - Gris
- **Raro (rare)** - Azul
- **Épico (epic)** - Púrpura  
- **Legendario (legendary)** - Dorado con brillos

## 🚀 Cómo Agregar un Nuevo Banner

### 1. Agregar a `bannerData.ts`:
```javascript
{
  id: 'mi-nuevo-banner',
  name: 'Mi Banner',
  emoji: '🎉',
  rarity: 'rare',
  description: 'Banner de ejemplo',
  category: 'unlockable',
  requirement: 'Hacer algo especial'
}
```

### 2. Agregar lógica en `useBannerStats.tsx`:
```javascript
case 'mi-nuevo-banner':
  return {
    current: stats.algo_especial,
    max: 50,
    unlocked: isUnlocked,
    description: `${stats.algo_especial}/50 cosas especiales`
  };
```

### 3. Agregar trigger en base de datos:
```sql
-- Si necesita trigger automático
IF NEW.algo_especial >= 50 THEN
  INSERT INTO user_banners (user_id, banner_id)
  VALUES (NEW.user_id, 'mi-nuevo-banner')
  ON CONFLICT DO NOTHING;
END IF;
```

## 🔐 Códigos Secretos

### ¿Cómo funcionan?

1. Usuario ingresa código en página de banners
2. Se llama a la función `award_banner_with_code()`
3. Si el código es correcto, se otorga el banner
4. Se muestra mensaje de éxito

### Código actual:
- **`REY_DEL_TODO_2025`** → Desbloquea "Fundador y Rey del Todo" 👑🔥

## 🐛 Problemas Comunes y Soluciones

### El banner no aparece:
1. ¿Está la base de datos actualizada?
2. ¿El trigger se ejecutó correctamente?
3. ¿El hook está leyendo los datos?
4. ¿El componente está mostrando la información?

### Los números no coinciden:
1. Verificar que los triggers estén funcionando
2. Comprobar que las consultas sean correctas
3. Revisar que las interfaces TypeScript coincidan

### Banner automático no se activa:
1. Verificar la lógica en `useAutomaticBanners`
2. Comprobar que los mensajes tengan las reacciones correctas
3. Revisar que el `currentUserId` sea correcto

## 📚 Glosario Técnico

- **Hook**: Función especial de React que empieza con "use"
- **Estado**: Variable que puede cambiar y hace que la interfaz se actualice
- **Efecto**: Código que se ejecuta cuando algo cambia
- **Componente**: Pieza de interfaz reutilizable
- **Props**: Datos que se pasan de un componente padre a un hijo
- **Trigger**: Función automática de base de datos
- **RPC**: Función personalizada de base de datos que se puede llamar desde código
- **Interface**: Definición de qué propiedades debe tener un objeto
- **Memoización**: Técnica para no recalcular cosas que no han cambiado

## 🎓 Para Estudiantes

### Conceptos importantes que aprenderás:

1. **React Hooks** - Cómo manejar estado y efectos
2. **Base de Datos** - Cómo almacenar y consultar información  
3. **Tiempo Real** - Cómo actualizar la interfaz automáticamente
4. **Arquitectura** - Cómo organizar código complejo
5. **UX/UI** - Cómo hacer interfaces atractivas para usuarios

### Recomendaciones de estudio:

1. **Primero** - Entiende qué hace cada archivo
2. **Segundo** - Sigue el flujo de datos paso a paso
3. **Tercero** - Experimenta cambiando pequeñas cosas
4. **Cuarto** - Intenta agregar tu propio banner simple
5. **Quinto** - Estudia cómo se conecta todo junto

---

¡Este sistema es un excelente ejemplo de aplicación completa con frontend, backend y base de datos trabajando juntos! 🚀