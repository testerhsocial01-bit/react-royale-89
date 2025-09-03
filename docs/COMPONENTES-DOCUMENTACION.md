# 🧩 Documentación de Componentes del Sistema de Banners

## 📋 Índice
1. [Banners.tsx - Página Principal](#bannerstsx---página-principal)
2. [BannerCard.tsx - Tarjeta de Banner](#bannercardtsx---tarjeta-de-banner)
3. [ChatAppV2.tsx - Aplicación de Chat](#chatappv2tsx---aplicación-de-chat)
4. [MessageBubbleV2.tsx - Burbuja de Mensaje](#messagebubblev2tsx---burbuja-de-mensaje)
5. [UserBanner.tsx - Banner Individual](#userbannertsx---banner-individual)

---

## `Banners.tsx` - Página Principal

### 🎯 ¿Qué hace este componente?
Esta es la página principal donde los usuarios pueden ver todos los banners disponibles, su progreso hacia nuevos banners, y canjear códigos secretos.

### 🖼️ Estructura Visual:
```
┌─────────────────────────────────────┐
│ 🏷️ Sistema de Banners [X/Y Desbloqueados] │
├─────────────────────────────────────┤
│ [Automáticos] [Misiones] [Exclusivos] [Todos] │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │ 🆕  │ │ 🏆  │ │ 👑  │  ...      │
│ │Banner│ │Banner│ │Banner│           │
│ └─────┘ └─────┘ └─────┘           │
├─────────────────────────────────────┤
│ 🔐 Código Secreto: [____] [Canjear] │
└─────────────────────────────────────┘
```

### 📊 Datos que utiliza:

#### Hooks que consume:
```javascript
const { user } = useAuth();                    // Usuario actual
const { profile } = useProfile();              // Perfil del usuario  
const { stats, userBanners, loading, getBannerProgress, redeemSecretCode } = useBannerStats();
```

#### Estados locales:
```javascript
const [selectedCategory, setSelectedCategory] = useState('all');  // Pestaña seleccionada
const [secretCode, setSecretCode] = useState('');                 // Código ingresado
const [isRedeemingCode, setIsRedeemingCode] = useState(false);    // Proceso de canje
```

### 🔧 Funciones principales:

#### `handleRedeemCode()`
**¿Qué hace?** Canjea un código secreto por un banner exclusivo

```javascript
const handleRedeemCode = async () => {
  if (!secretCode.trim()) return;           // Validar que hay código
  
  setIsRedeemingCode(true);                 // Mostrar "cargando"
  const success = await redeemSecretCode(secretCode);  // Intentar canjear
  if (success) {
    setSecretCode('');                      // Limpiar input si éxito
  }
  setIsRedeemingCode(false);               // Ocultar "cargando"
};
```

#### `filterBanners(category)`
**¿Qué hace?** Filtra banners por categoría (automáticos, misiones, exclusivos)

```javascript
const filterBanners = (category) => {
  if (category === 'all') return DETAILED_BANNERS;         // Todos
  return DETAILED_BANNERS.filter(banner => banner.category === category);
};
```

### 🎨 Secciones de la interfaz:

#### 1. **Header con estadísticas:**
```jsx
<CardTitle className="flex items-center gap-3 text-2xl">
  🏷️ Sistema de Banners
  <Badge className="bg-primary text-primary-foreground">
    {unlockedCount}/{DETAILED_BANNERS.length} Desbloqueados
  </Badge>
</CardTitle>
```

#### 2. **Pestañas de categorías:**
```jsx
<TabsList className="grid w-full grid-cols-4">
  <TabsTrigger value="automatic">⚡ Automáticos</TabsTrigger>
  <TabsTrigger value="unlockable">🏆 Misiones</TabsTrigger>
  <TabsTrigger value="exclusive">👑 Exclusivos</TabsTrigger>
  <TabsTrigger value="all">Todos</TabsTrigger>
</TabsList>
```

#### 3. **Grid de banners:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {banners.map((banner) => (
    <BannerCard
      key={banner.id}
      banner={banner}
      isUnlocked={progress.unlocked}
      progress={progress.current}
      maxProgress={progress.max}
      description={progress.description}
    />
  ))}
</div>
```

#### 4. **Sección de código secreto:**
```jsx
<div className="flex gap-2">
  <Input
    placeholder="Ingresa tu código secreto..."
    value={secretCode}
    onChange={(e) => setSecretCode(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleRedeemCode()}
  />
  <Button onClick={handleRedeemCode} disabled={!secretCode.trim() || isRedeemingCode}>
    {isRedeemingCode ? 'Canjeando...' : 'Canjear'}
  </Button>
</div>
```

### 🔄 Flujo de interacción:

1. **Usuario entra a página** → Se cargan estadísticas y banners
2. **Hace clic en pestaña** → `setSelectedCategory()` filtra banners
3. **Ve progreso** → Cada `BannerCard` muestra su estado individual
4. **Ingresa código** → `handleRedeemCode()` intenta canjearlo
5. **Banner desbloqueado** → Página se actualiza automáticamente

---

## `BannerCard.tsx` - Tarjeta de Banner

### 🎯 ¿Qué hace este componente?
Muestra la información detallada de un banner individual: nombre, descripción, progreso, y estado de desbloqueo.

### 🖼️ Estructura Visual:
```
┌─────────────────────────┐
│ 🔒 [RARE] ⚡           │ ← Candado, rareza, categoría
├─────────────────────────┤
│ 🏆 Nombre del Banner    │ ← Emoji y nombre
│ Descripción del banner  │ ← Descripción
│ Requisito: Hacer X cosa │ ← Cómo obtenerlo
├─────────────────────────┤
│ ████████░░ 80/100       │ ← Barra de progreso
│ [Desbloqueado] / [🔒]   │ ← Estado
└─────────────────────────┘
```

### 📊 Props que recibe:
```typescript
interface BannerCardProps {
  banner: DetailedBanner;    // Información del banner
  isUnlocked: boolean;       // ¿Ya lo tiene el usuario?
  progress?: number;         // Progreso actual (ej: 75)
  maxProgress?: number;      // Progreso necesario (ej: 100)
  description?: string;      // Texto descriptivo del progreso
  className?: string;        // Clases CSS adicionales
}
```

### 🎨 Funciones de estilo:

#### `getRarityClasses(rarity)`
**¿Qué hace?** Devuelve las clases CSS según la rareza del banner

```javascript
const getRarityClasses = (rarity) => {
  switch (rarity) {
    case 'legendary':
      return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20';
    case 'epic':  
      return 'border-purple-400 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20';
    case 'rare':
      return 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20';
    default: // common
      return 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20';
  }
};
```

#### `getCategoryIcon(category)`
**¿Qué hace?** Muestra el icono correspondiente a la categoría

```javascript
const getCategoryIcon = (category) => {
  switch (category) {
    case 'exclusive':
      return <Crown className="w-4 h-4 text-yellow-600" />;     // 👑 Exclusivos
    case 'automatic':  
      return <Zap className="w-4 h-4 text-blue-600" />;        // ⚡ Automáticos
    case 'unlockable':
      return <Trophy className="w-4 h-4 text-green-600" />;    // 🏆 Misiones
    default:
      return null;
  }
};
```

### 🧩 Estructura del componente:

#### 1. **Header con indicadores:**
```jsx
<div className="flex items-center justify-between mb-2">
  {/* Candado si no está desbloqueado */}
  {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
  
  <div className="flex items-center gap-2">
    {/* Badge de rareza */}
    <Badge variant="secondary" className="text-xs">
      {banner.rarity.toUpperCase()}
    </Badge>
    
    {/* Icono de categoría */}
    {getCategoryIcon(banner.category)}
    
    {/* Badge temporal si aplica */}
    {banner.isTemporary && (
      <Badge variant="outline" className="text-xs">⏱️ Temporal</Badge>
    )}
  </div>
</div>
```

#### 2. **Información principal:**
```jsx
<div className="text-center mb-4">
  <div className="text-2xl mb-1">{banner.emoji}</div>
  <h3 className="font-bold text-lg">{banner.name}</h3>
  <p className="text-sm text-muted-foreground mt-1">{banner.description}</p>
  <p className="text-xs text-muted-foreground mt-2 italic">
    <strong>Requisito:</strong> {banner.requirement}
  </p>
</div>
```

#### 3. **Barra de progreso:**
```jsx
{maxProgress && maxProgress > 1 && (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>Progreso</span>
      <span>{progress}/{maxProgress}</span>
    </div>
    <Progress 
      value={(progress / maxProgress) * 100} 
      className="h-2" 
    />
    {description && (
      <p className="text-xs text-muted-foreground">{description}</p>
    )}
  </div>
)}
```

#### 4. **Estado de desbloqueo:**
```jsx
<div className="mt-4 text-center">
  {isUnlocked ? (
    <Badge className="bg-green-500 text-white">
      ✅ Desbloqueado
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      🔒 Bloqueado
    </Badge>
  )}
</div>
```

---

## `ChatAppV2.tsx` - Aplicación de Chat

### 🎯 ¿Qué hace este componente?
Es la aplicación principal del chat que integra todos los sistemas: mensajes, reacciones, banners automáticos y permanentes.

### 🖼️ Estructura Visual:
```
┌─────────────────────────────────────┐
│ Header: Sala actual, usuarios online │
├─────────────────────────────────────┤
│ ┌─ Usuario1 🏆🎖️ ──────────────┐   │
│ │ Mensaje del usuario...          │   │
│ │ ❤️ 3  😂 1  💡 2              │   │
│ └─────────────────────────────────┘   │
│ ┌─ Usuario2 ⚡👑 ──────────────┐   │  
│ │ Otro mensaje...                 │   │
│ │ ❤️ 5  😂 0  💡 1              │   │
│ └─────────────────────────────────┘   │
├─────────────────────────────────────┤
│ [Escribir mensaje...] [Enviar]      │
└─────────────────────────────────────┘
```

### 📊 Datos que maneja:

#### Hooks principales:
```javascript
const { user } = useAuth();                              // Usuario actual
const { 
  messages, 
  sendMessage, 
  addReaction, 
  connectedUsers 
} = useChat();                                           // Funcionalidad del chat
const { automaticBanners } = useAutomaticBanners({ 
  messages, 
  currentUserId: user?.id 
});                                                      // Banners automáticos
const { userBanners } = useBannerStats();               // Banners permanentes
```

### 🔧 Funciones principales:

#### `handleSendMessage(content)`
**¿Qué hace?** Envía un nuevo mensaje al chat

```javascript
const handleSendMessage = async (content) => {
  if (!content.trim()) return;                          // Validar contenido
  
  await sendMessage(content);                           // Enviar a base de datos
  // Los triggers automáticos actualizarán estadísticas
  // Los hooks detectarán cambios y actualizarán banners
};
```

#### `handleReaction(messageId, emoji)`
**¿Qué hace?** Agrega una reacción a un mensaje

```javascript
const handleReaction = async (messageId, emoji) => {
  await addReaction(messageId, emoji);                  // Guardar reacción
  // Trigger actualiza estadísticas del autor del mensaje
  // Banners se recalculan automáticamente
};
```

#### `getUserBanners(userId)`
**¿Qué hace?** Combina banners automáticos y permanentes para un usuario

```javascript
const getUserBanners = (userId) => {
  // Banners automáticos (temporales)
  const automatic = automaticBanners
    .filter(banner => banner.isActive && banner.userId === userId)
    .map(banner => ({ ...banner, isAutomatic: true }));
    
  // Banners permanentes equipados
  const permanent = userBanners
    .filter(banner => banner.user_id === userId && banner.equipped)
    .map(banner => ({ ...banner.banners, isAutomatic: false }));
    
  return [...automatic, ...permanent];
};
```

### 🎨 Renderizado de mensajes:

#### Lista de mensajes con banners:
```jsx
{messages.map((message) => {
  const userBanners = getUserBanners(message.user_id);
  
  return (
    <MessageBubbleV2
      key={message.id}
      message={message}
      automaticBanners={userBanners.filter(b => b.isAutomatic)}
      onToggleReaction={(emoji) => handleReaction(message.id, emoji)}
      onLikeUser={() => handleLikeUser(message.user_id)}
    />
  );
})}
```

### 🔄 Flujo de datos en tiempo real:

1. **Usuario escribe mensaje** → `handleSendMessage()` 
2. **Se guarda en BD** → Trigger actualiza `user_stats`
3. **Supabase notifica cambio** → `useChat` detecta nuevo mensaje
4. **Hook recalcula** → `useAutomaticBanners` analiza nuevos datos
5. **Interfaz se actualiza** → Nuevos banners aparecen automáticamente

---

## `MessageBubbleV2.tsx` - Burbuja de Mensaje

### 🎯 ¿Qué hace este componente?
Muestra un mensaje individual con toda su información: usuario, banners, contenido, reacciones, y botones de interacción.

### 🖼️ Estructura Visual:
```
┌─────────────────────────────────────┐
│ 👤 Usuario 🏆⚡👑                  │ ← Avatar, nombre, banners
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Este es el contenido del mensaje... │ ← Texto del mensaje
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ❤️ 5  😂 2  💡 1    [❤️] [😊]     │ ← Reacciones + botones
└─────────────────────────────────────┘
```

### 📊 Props que recibe:
```typescript
interface MessageBubbleV2Props {
  message: Message;                    // Datos del mensaje
  automaticBanners?: AutomaticBanner[]; // Banners automáticos del usuario
  onToggleReaction?: (emoji: string) => void; // Función para reaccionar
  onLikeUser?: () => void;            // Función para "me gusta" al usuario
}
```

### 🎨 Estructura del componente:

#### 1. **Header con usuario y banners:**
```jsx
<div className="flex items-center gap-2 mb-1">
  {/* Avatar del usuario */}
  <Avatar className="w-6 h-6">
    <AvatarImage src={message.profiles?.avatar_url} />
    <AvatarFallback>{message.profiles?.display_name?.[0]}</AvatarFallback>
  </Avatar>
  
  {/* Nombre del usuario */}
  <span className="font-semibold text-sm">
    {message.profiles?.display_name || 'Usuario'}
  </span>
  
  {/* Banners automáticos */}
  {automaticBanners?.map((banner) => (
    <UserBanner key={banner.id} banner={banner} />
  ))}
  
  {/* Banners permanentes equipados */}
  {permanentBanners?.map((banner) => (
    <UserBanner key={banner.id} banner={banner} />
  ))}
</div>
```

#### 2. **Contenido del mensaje:**
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
  <p className="text-sm leading-relaxed">{message.content}</p>
</div>
```

#### 3. **Reacciones existentes:**
```jsx
<div className="flex items-center gap-2 mt-2">
  {/* Mostrar cada tipo de reacción con su contador */}
  {['❤️', '😂', '💡', '💩'].map((emoji) => {
    const count = reactions.filter(r => r.emoji === emoji).length;
    if (count === 0) return null;
    
    return (
      <button
        key={emoji}
        onClick={() => onToggleReaction?.(emoji)}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
      >
        <span>{emoji}</span>
        <span className="text-xs font-medium">{count}</span>
      </button>
    );
  })}
</div>
```

#### 4. **Botones de interacción:**
```jsx
<div className="flex items-center gap-2 mt-2">
  {/* Botón de "me gusta" rápido */}
  <button
    onClick={onLikeUser}
    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
  >
    ❤️ Me gusta
  </button>
  
  {/* Botón para panel de emojis */}
  <button
    onClick={() => setShowEmojiPanel(!showEmojiPanel)}
    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
  >
    😊 Reaccionar
  </button>
</div>

{/* Panel de emojis expandible */}
{showEmojiPanel && (
  <EmojiReactionPanel
    onReaction={(emoji) => {
      onToggleReaction?.(emoji);
      setShowEmojiPanel(false);
    }}
  />
)}
```

### 🔄 Estados interactivos:

#### Estados locales:
```javascript
const [showEmojiPanel, setShowEmojiPanel] = useState(false);  // Panel de reacciones
const [showProfileTooltip, setShowProfileTooltip] = useState(false); // Tooltip de perfil
```

#### Funciones de interacción:
```javascript
const handleQuickLike = () => {
  onToggleReaction?.('❤️');                   // Reacción rápida con ❤️
  onLikeUser?.();                             // Acción adicional de "me gusta"
};

const handleEmojiSelect = (emoji) => {
  onToggleReaction?.(emoji);                  // Agregar reacción seleccionada
  setShowEmojiPanel(false);                   // Cerrar panel
};
```

---

## `UserBanner.tsx` - Banner Individual

### 🎯 ¿Qué hace este componente?
Renderiza un banner individual tal como aparece al lado del nombre de usuario en el chat.

### 🖼️ Estructura Visual:
```
┌─────────────────┐
│ 👑 🏆 Leyenda   │ ← Icono especial + emoji + nombre
└─────────────────┘
```

### 📊 Props que recibe:
```typescript
interface UserBannerProps {
  banner: Banner;        // Información del banner
  isTop?: boolean;       // ¿Es el banner más importante? (agrega corona)
  className?: string;    // Clases CSS adicionales
}
```

### 🎨 Estilos por rareza:

#### `getRarityClasses(rarity)`
```javascript
const getRarityClasses = (rarity) => {
  switch (rarity) {
    case 'legendary':
      return 'banner-legendary text-white font-bold';     // Dorado brillante
    case 'epic':
      return 'banner-epic text-white font-bold';          // Púrpura brillante  
    case 'rare':
      return 'banner-rare text-white font-semibold';      // Azul brillante
    default:
      return 'banner-common text-white';                   // Gris estándar
  }
};
```

### 🧩 Estructura del componente:
```jsx
<div 
  className={`
    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
    ${getRarityClasses(banner.rarity)}
    ${isTop ? 'banner-glow crown-spin' : ''}      // Efectos especiales para VIP
    ${className}
  `}
  title={banner.description}                       // Tooltip con descripción
>
  {/* Corona especial para banner principal */}
  {isTop && <Crown className="w-3 h-3" />}
  
  {/* Emoji del banner */}
  <span>{banner.emoji}</span>
  
  {/* Nombre del banner */}
  <span className="font-medium">{banner.name}</span>
</div>
```

### 🎨 Efectos CSS especiales:

#### Clases de rareza (definidas en CSS):
```css
.banner-legendary {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.banner-epic {
  background: linear-gradient(45deg, #8b5cf6, #a855f7);  
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
}

.banner-rare {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.3);
}

.banner-common {
  background: linear-gradient(45deg, #6b7280, #4b5563);
}
```

#### Animaciones para banner especial:
```css
.banner-glow {
  animation: glow 2s ease-in-out infinite alternate;
}

.crown-spin {
  animation: spin 3s linear infinite;
}

@keyframes glow {
  from { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
  to { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
}
```

---

## 🎓 Para Estudiantes: Conceptos de Componentes

### 1. **Props (Propiedades)**
```javascript
// Componente padre pasa datos al hijo
<BannerCard 
  banner={bannerData}      // ← Esto es una prop
  isUnlocked={true}        // ← Esto también
/>

// Componente hijo recibe las props
const BannerCard = ({ banner, isUnlocked }) => {
  // Usar banner.name, isUnlocked, etc.
};
```

### 2. **Estado Local**
```javascript
const [showPanel, setShowPanel] = useState(false);

// showPanel = valor actual (false inicialmente)
// setShowPanel = función para cambiar el valor
// useState(false) = valor inicial
```

### 3. **Eventos y Callbacks**
```javascript
// Componente padre define qué hacer
const handleReaction = (emoji) => {
  console.log('Usuario reaccionó con:', emoji);
};

// Componente hijo recibe la función como prop
<MessageBubble onToggleReaction={handleReaction} />

// Componente hijo ejecuta la función cuando algo pasa
<button onClick={() => onToggleReaction('❤️')}>
  Dar corazón
</button>
```

### 4. **Renderizado Condicional**
```javascript
{isUnlocked ? (
  <span>✅ Desbloqueado</span>     // Si está desbloqueado
) : (
  <span>🔒 Bloqueado</span>       // Si no está desbloqueado
)}

{banners.length > 0 && (         // Solo mostrar si hay banners
  <div>Lista de banners...</div>
)}
```

### 5. **Mapeo de Listas**
```javascript
{banners.map((banner) => (       // Por cada banner en la lista
  <BannerCard                    // Crear un componente BannerCard
    key={banner.id}              // ← Key único (muy importante!)
    banner={banner}              // ← Pasar datos del banner
  />
))}
```

### 🏆 Consejos para entender mejor:

1. **Sigue el flujo de datos:** Padre → Props → Hijo → Evento → Callback → Padre
2. **Entiende el estado:** ¿Qué puede cambiar? ¿Dónde se guarda?
3. **Lee los nombres:** `MessageBubble` claramente muestra mensajes
4. **Mira las props:** Te dicen qué necesita el componente para funcionar
5. **Experimenta:** Cambia una prop y ve qué pasa en la interfaz

---

## 🔍 Debugging de Componentes

### 1. **Props no llegan:**
```javascript
console.log('Props recibidas:', { banner, isUnlocked, progress });
```

### 2. **Estado no cambia:**
```javascript
console.log('Estado actual:', showPanel);
console.log('Cambiando estado a:', !showPanel);
setShowPanel(!showPanel);
```

### 3. **Evento no se ejecuta:**
```javascript
const handleClick = () => {
  console.log('¡Botón clickeado!');
  onToggleReaction?.('❤️');
};
```

### 4. **Renderizado problemático:**
```javascript
console.log('Renderizando con datos:', { banners, messages, user });
```

¡Con esta documentación ya entiendes cómo funciona cada componente del sistema! 🚀