# 🚀 Guía Paso a Paso: Sistema de Banners

## 📚 Índice
1. [Flujo Completo: Usuario Envía Mensaje](#flujo-completo-usuario-envía-mensaje)
2. [Flujo Completo: Usuario Recibe Reacción](#flujo-completo-usuario-recibe-reacción)
3. [Flujo Completo: Canjear Código Secreto](#flujo-completo-canjear-código-secreto)
4. [Cómo se Calculan los Banners Automáticos](#cómo-se-calculan-los-banners-automáticos)
5. [Cómo Agregar un Nuevo Banner](#cómo-agregar-un-nuevo-banner)
6. [Cómo Debuggear Problemas](#cómo-debuggear-problemas)

---

## 🔄 Flujo Completo: Usuario Envía Mensaje

### Paso 1: Usuario escribe y envía mensaje
```
👤 Usuario escribe: "¡Hola a todos!"
💻 Hace clic en "Enviar"
```

### Paso 2: Frontend procesa el mensaje
```javascript
// En ChatAppV2.tsx
const handleSendMessage = async (content) => {
  await sendMessage(content);  // useChat hook
};
```

### Paso 3: Hook useChat guarda en base de datos
```javascript
// En useChat.tsx
const sendMessage = async (content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content: content,
      user_id: user.id,
      room_id: currentRoom.id
    });
};
```

### Paso 4: Base de datos guarda el mensaje
```sql
-- Tabla: messages
INSERT INTO messages (id, content, user_id, room_id, created_at)
VALUES ('uuid-123', '¡Hola a todos!', 'user-456', 'room-789', NOW());
```

### Paso 5: Trigger automático se ejecuta
```sql
-- Función: update_user_stats_on_message()
-- Se ejecuta automáticamente después del INSERT

UPDATE user_stats SET
  messages_sent_total = messages_sent_total + 1,
  last_message_at = NOW()
WHERE user_id = NEW.user_id;
```

### Paso 6: Verificación de banners por trigger
```sql
-- Función: award_banner_on_milestone()
-- Se ejecuta después de actualizar estadísticas

-- Ejemplo: Si llegó a 200 mensajes, otorgar "modo-diablo"
IF (SELECT messages_sent_total FROM user_stats WHERE user_id = NEW.user_id) >= 200 THEN
  INSERT INTO user_banners (user_id, banner_id, unlocked_at)
  VALUES (NEW.user_id, 'modo-diablo', NOW())
  ON CONFLICT DO NOTHING;
END IF;
```

### Paso 7: Supabase notifica cambios en tiempo real
```javascript
// useChat hook está suscrito a cambios
supabase
  .from('messages')
  .on('INSERT', (payload) => {
    setMessages(prev => [...prev, payload.new]);  // Nuevo mensaje aparece
  })
  .subscribe();
```

### Paso 8: Hooks reaccionan a los cambios
```javascript
// useBannerStats detecta cambio en user_stats
useEffect(() => {
  // Recargar estadísticas cuando user cambia
  loadStats();
}, [user]);

// useAutomaticBanners recalcula con nuevos mensajes
const automaticBanners = useMemo(() => {
  // Analizar todos los mensajes y calcular banners automáticos
}, [messages, currentUserId]);
```

### Paso 9: Interfaz se actualiza automáticamente
```javascript
// ChatAppV2.tsx renderiza con nuevos datos
{messages.map((message) => {
  const userBanners = getUserBanners(message.user_id);  // Incluye nuevos banners
  return (
    <MessageBubbleV2
      message={message}
      automaticBanners={userBanners}
    />
  );
})}
```

### 🎯 Resultado final:
- ✅ Mensaje aparece en el chat
- ✅ Contador de mensajes del usuario aumenta
- ✅ Si alcanzó un hito, nuevo banner se desbloquea
- ✅ Banners automáticos se recalculan
- ✅ Todo se actualiza en tiempo real para todos los usuarios

---

## ❤️ Flujo Completo: Usuario Recibe Reacción

### Paso 1: Usuario hace clic en reacción
```
👤 Usuario ve mensaje de otro usuario
😍 Hace clic en botón "❤️"
```

### Paso 2: Frontend procesa la reacción
```javascript
// En MessageBubbleV2.tsx
const handleReaction = (emoji) => {
  onToggleReaction?.(emoji);  // Callback al padre
};

// En ChatAppV2.tsx  
const handleReaction = async (messageId, emoji) => {
  await addReaction(messageId, emoji);  // useChat hook
};
```

### Paso 3: Hook useChat guarda la reacción
```javascript
// En useChat.tsx
const addReaction = async (messageId, emoji) => {
  const { data, error } = await supabase
    .from('message_reactions')
    .insert({
      message_id: messageId,
      user_id: user.id,
      emoji: emoji
    });
};
```

### Paso 4: Base de datos guarda la reacción
```sql
-- Tabla: message_reactions
INSERT INTO message_reactions (id, message_id, user_id, emoji, created_at)
VALUES ('uuid-abc', 'msg-123', 'reactor-456', '❤️', NOW());
```

### Paso 5: Trigger automático actualiza estadísticas del AUTOR del mensaje
```sql
-- Función: update_user_stats_on_reaction()
-- Se ejecuta automáticamente después del INSERT en message_reactions

-- Primero encuentra quién escribió el mensaje original
DECLARE author_id UUID;
SELECT user_id INTO author_id 
FROM messages 
WHERE id = NEW.message_id;

-- Luego actualiza las estadísticas del AUTOR (no del que reacciona)
UPDATE user_stats SET
  reactions_received_total = reactions_received_total + 1,
  hearts_total = hearts_total + CASE WHEN NEW.emoji = '❤️' THEN 1 ELSE 0 END,
  laughs_total = laughs_total + CASE WHEN NEW.emoji = '😂' THEN 1 ELSE 0 END,
  ideas_total = ideas_total + CASE WHEN NEW.emoji = '💡' THEN 1 ELSE 0 END,
  poops_total = poops_total + CASE WHEN NEW.emoji = '💩' THEN 1 ELSE 0 END
WHERE user_id = author_id;
```

### Paso 6: Verificación de banners por hitos
```sql
-- Función: award_banner_on_milestone()
-- Verifica si el AUTOR del mensaje merece un nuevo banner

DECLARE stats_row user_stats%ROWTYPE;
SELECT * INTO stats_row FROM user_stats WHERE user_id = author_id;

-- Ejemplo: Si llegó a 50 corazones, otorgar "goat"
IF stats_row.hearts_total >= 50 THEN
  INSERT INTO user_banners (user_id, banner_id, unlocked_at)
  VALUES (author_id, 'goat', NOW())
  ON CONFLICT DO NOTHING;
END IF;

-- Ejemplo: Si llegó a 100 reacciones totales, otorgar "leyenda"
IF stats_row.reactions_received_total >= 100 THEN
  INSERT INTO user_banners (user_id, banner_id, unlocked_at)
  VALUES (author_id, 'leyenda', NOW())
  ON CONFLICT DO NOTHING;
END IF;
```

### Paso 7: Supabase notifica cambios
```javascript
// useChat suscrito a cambios en message_reactions
supabase
  .from('message_reactions')
  .on('INSERT', (payload) => {
    // Actualizar lista de reacciones
    updateMessageReactions(payload.new);
  })
  .subscribe();
```

### Paso 8: Hooks reaccionan a los cambios
```javascript
// useBannerStats del AUTOR detecta cambio en sus estadísticas
// (si está conectado al mismo tiempo)
useEffect(() => {
  const subscription = supabase
    .from('user_stats')
    .on('UPDATE', (payload) => {
      if (payload.new.user_id === user.id) {
        setStats(payload.new);  // Actualizar estadísticas en tiempo real
      }
    })
    .subscribe();
}, [user]);

// useAutomaticBanners recalcula para todos los usuarios
const automaticBanners = useMemo(() => {
  // Con las nuevas reacciones, recalcular quién tiene más ❤️, etc.
  return calculateAutomaticBanners(messages, currentUserId);
}, [messages, currentUserId]);
```

### Paso 9: Interfaz se actualiza
```javascript
// El mensaje ahora muestra la nueva reacción
<div className="flex items-center gap-2">
  {reactionCounts.hearts > 0 && (
    <span className="text-sm">❤️ {reactionCounts.hearts}</span>
  )}
  {/* ...otras reacciones */}
</div>

// El autor puede ver nuevos banners automáticos
{automaticBanners.map(banner => (
  <UserBanner key={banner.id} banner={banner} />
))}
```

### 🎯 Resultado final:
- ✅ Reacción aparece en el mensaje
- ✅ Estadísticas del AUTOR del mensaje se actualizan
- ✅ Si el autor alcanzó un hito, recibe nuevo banner permanente
- ✅ Banners automáticos se recalculan (ej: "Corazón de Oro")
- ✅ Todos ven los cambios en tiempo real

---

## 🔐 Flujo Completo: Canjear Código Secreto

### Paso 1: Usuario va a página de banners
```
👤 Usuario navega a /banners
🔍 Ve sección "Código Secreto"
⌨️ Escribe: "REY_DEL_TODO_2025"
🖱️ Hace clic en "Canjear"
```

### Paso 2: Frontend valida y procesa
```javascript
// En Banners.tsx
const handleRedeemCode = async () => {
  if (!secretCode.trim()) return;           // Validar que hay código
  
  setIsRedeemingCode(true);                 // Mostrar loading
  const success = await redeemSecretCode(secretCode);
  if (success) {
    setSecretCode('');                      // Limpiar input
  }
  setIsRedeemingCode(false);               // Ocultar loading
};
```

### Paso 3: Hook llama función RPC de Supabase
```javascript
// En useBannerStats.tsx
const redeemSecretCode = async (code) => {
  try {
    const { data, error } = await supabase
      .rpc('award_banner_with_code', {      // Función personalizada de BD
        p_user_id: user.id,
        p_code: code.trim()
      });
    
    if (error) {
      // Mostrar error "código incorrecto"
      return false;
    }
    
    if (data) {
      // Mostrar éxito "banner desbloqueado"
      return true;
    }
  } catch (error) {
    // Manejar errores de conexión
    return false;
  }
};
```

### Paso 4: Base de datos ejecuta función RPC
```sql
-- Función: award_banner_with_code(p_user_id UUID, p_code TEXT)

CREATE OR REPLACE FUNCTION award_banner_with_code(p_user_id UUID, p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  banner_to_award TEXT;
BEGIN
  -- Verificar qué banner corresponde al código
  CASE p_code
    WHEN 'REY_DEL_TODO_2025' THEN
      banner_to_award := 'fundador';
    WHEN 'OTRO_CODIGO_SECRETO' THEN  
      banner_to_award := 'otro-banner';
    ELSE
      RETURN FALSE;  -- Código inválido
  END CASE;
  
  -- Verificar que no lo tenga ya
  IF EXISTS (SELECT 1 FROM user_banners WHERE user_id = p_user_id AND banner_id = banner_to_award) THEN
    RETURN FALSE;  -- Ya lo tiene
  END IF;
  
  -- Otorgar el banner
  INSERT INTO user_banners (user_id, banner_id, unlocked_at)
  VALUES (p_user_id, banner_to_award, NOW());
  
  RETURN TRUE;  -- Éxito
END;
$$ LANGUAGE plpgsql;
```

### Paso 5: Frontend recibe respuesta
```javascript
// En useBannerStats.tsx (continuación)
if (data) {  // data = TRUE si fue exitoso
  toast({
    title: "¡Banner desbloqueado!",
    description: "Has obtenido el banner 'Fundador y Rey del Todo' 👑🔥",
  });
  
  // Recargar banners del usuario
  const { data: bannersData } = await supabase
    .from('user_banners')
    .select('*, banners(*)')
    .eq('user_id', user.id);
  
  setUserBanners(bannersData || []);
  return true;
}
```

### Paso 6: Interfaz se actualiza automáticamente
```javascript
// En Banners.tsx, el hook reacciona al cambio en userBanners
const unlockedCount = userBanners.length;  // Ahora incluye el nuevo banner

// Las tarjetas de banners se actualizan
{DETAILED_BANNERS.map((banner) => {
  const progress = getBannerProgress(banner.id);  // Ahora unlocked = true
  return (
    <BannerCard
      banner={banner}
      isUnlocked={progress.unlocked}  // ✅ Ahora es true
      progress={progress.current}
      maxProgress={progress.max}
    />
  );
})}
```

### Paso 7: Banner aparece en el chat
```javascript
// En ChatAppV2.tsx, el usuario puede equipar el nuevo banner
// Si está en su lista de banners equipados, aparece en sus mensajes
<MessageBubbleV2
  message={message}
  automaticBanners={automaticBanners}
  // Los banners permanentes incluyen el nuevo "fundador"
/>
```

### 🎯 Resultado final:
- ✅ Código se valida correctamente
- ✅ Banner "Fundador y Rey del Todo" se agrega a la colección
- ✅ Usuario recibe notificación de éxito
- ✅ Banner aparece como "Desbloqueado" en la página
- ✅ Usuario puede equiparlo en su perfil
- ✅ Banner aparece con efectos especiales en el chat

---

## ⚡ Cómo se Calculan los Banners Automáticos

### Concepto: ¿Qué son los banners automáticos?
Los banners automáticos aparecen **dinámicamente** basándose en el estado actual del chat. No se guardan en la base de datos, se calculan en tiempo real.

### Ejemplo: Banner "Número 1"

#### Paso 1: Analizar todos los mensajes del chat actual
```javascript
// En useAutomaticBanners.tsx
const userStats = useMemo(() => {
  const stats = {};
  
  // Por cada mensaje en el chat
  messages.forEach(message => {
    const userId = message.user_id;
    
    // Inicializar stats del usuario si no existe
    if (!stats[userId]) {
      stats[userId] = {
        totalReactions: 0,
        hearts: 0,
        laughs: 0,
        ideas: 0,
        messages: 0
      };
    }
    
    // Contar este mensaje
    stats[userId].messages += 1;
    
    // Contar reacciones de este mensaje
    message.reactions?.forEach(reaction => {
      stats[userId].totalReactions += 1;
      
      switch (reaction.emoji) {
        case '❤️':
          stats[userId].hearts += 1;
          break;
        case '😂':
          stats[userId].laughs += 1;
          break;
        case '💡':
          stats[userId].ideas += 1;
          break;
      }
    });
  });
  
  return stats;
}, [messages]);
```

#### Paso 2: Determinar quién tiene más reacciones
```javascript
// Encontrar al usuario con más reacciones totales
const topUser = Object.entries(userStats).reduce((champion, [userId, stats]) => {
  if (stats.totalReactions > champion.totalReactions) {
    return { userId, totalReactions: stats.totalReactions };
  }
  return champion;
}, { userId: null, totalReactions: 0 });
```

#### Paso 3: Activar banner si aplica al usuario actual
```javascript
const automaticBanners = [];

// Solo si el usuario actual es el campeón
if (topUser.userId === currentUserId && topUser.totalReactions > 0) {
  automaticBanners.push({
    id: 'numero-1',
    name: 'Número 1',
    emoji: '🏆',
    rarity: 'epic',
    description: `Eres quien más reacciones ha recibido (${topUser.totalReactions})`,
    isActive: true
  });
}
```

### Ejemplo: Banner "Corazón de Oro" (solo últimos 50 mensajes)

```javascript
// Analizar solo mensajes recientes para banners temporales
const recentMessages = messages.slice(-50);  // Últimos 50 mensajes

const recentHeartStats = {};
recentMessages.forEach(message => {
  const userId = message.user_id;
  const heartCount = message.reactions?.filter(r => r.emoji === '❤️').length || 0;
  
  recentHeartStats[userId] = (recentHeartStats[userId] || 0) + heartCount;
});

// Encontrar quien tiene más ❤️ en mensajes recientes
const heartChampion = Object.entries(recentHeartStats).reduce((champ, [userId, hearts]) => {
  return hearts > champ.hearts ? { userId, hearts } : champ;
}, { userId: null, hearts: 0 });

if (heartChampion.userId === currentUserId && heartChampion.hearts >= 5) {
  automaticBanners.push({
    id: 'corazon-oro-auto',
    name: 'Corazón de Oro',
    emoji: '💛',
    rarity: 'rare',
    description: `Eres quien más ❤️ ha recibido recientemente (${heartChampion.hearts})`,
    isActive: true
  });
}
```

### 🔄 Cuándo se recalculan:

1. **Nuevo mensaje enviado** → `messages` cambia → `useMemo` recalcula
2. **Nueva reacción agregada** → `messages` se actualiza → recálculo automático
3. **Usuario diferente** → `currentUserId` cambia → recálculo para nuevo usuario

### 🎯 Ventajas de banners automáticos:
- ✅ **Tiempo real:** Aparecen y desaparecen instantáneamente
- ✅ **Dinámicos:** Se adaptan al estado actual del chat
- ✅ **Competitivos:** Crean competencia entre usuarios
- ✅ **Sin almacenamiento:** No ocupan espacio en base de datos

---

## ➕ Cómo Agregar un Nuevo Banner

### Escenario: Queremos crear banner "Madrugador" para quien envía mensaje antes de las 6 AM

#### Paso 1: Decidir el tipo de banner

**Opción A: Banner Automático** (temporal, basado en chat actual)
```javascript
// Se activa si tienes mensajes de madrugada en el chat actual
// Desaparece si otros también envían mensajes de madrugada
```

**Opción B: Banner por Misión** (permanente, basado en estadísticas)
```javascript
// Se desbloquea permanentemente al enviar 5 mensajes antes de las 6 AM
// Una vez desbloqueado, lo tienes para siempre
```

Vamos con **Opción B** para este ejemplo.

#### Paso 2: Agregar banner a la data
```javascript
// En bannerData.ts
export const DETAILED_BANNERS: DetailedBanner[] = [
  // ... banners existentes
  {
    id: 'madrugador',                    // ID único
    name: 'Madrugador',                  // Nombre mostrado
    emoji: '🌅',                         // Emoji representativo
    rarity: 'rare',                      // Rareza (common, rare, epic, legendary)
    description: 'Los que trasnochan saben valorar la madrugada', // Descripción
    category: 'unlockable',              // Categoría (automatic, unlockable, exclusive)
    requirement: 'Enviar 5 mensajes antes de las 6:00 AM',        // Cómo obtenerlo
    isTemporary: false,                  // No es temporal
    hasAnimation: false                  // Sin animaciones especiales
  }
];
```

#### Paso 3: Agregar campo a la base de datos (opcional)
```sql
-- Si queremos trackear mensajes de madrugada, agregar campo a user_stats
ALTER TABLE user_stats ADD COLUMN early_messages_total INTEGER DEFAULT 0;
```

#### Paso 4: Crear trigger para detectar mensajes de madrugada
```sql
-- Función para actualizar estadísticas cuando se envía mensaje de madrugada
CREATE OR REPLACE FUNCTION update_early_message_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar si es antes de las 6 AM (hora local)
  IF EXTRACT(HOUR FROM NEW.created_at AT TIME ZONE 'America/Mexico_City') < 6 THEN
    -- Incrementar contador de mensajes de madrugada
    UPDATE user_stats SET
      early_messages_total = early_messages_total + 1
    WHERE user_id = NEW.user_id;
    
    -- Verificar si merece el banner
    IF (SELECT early_messages_total FROM user_stats WHERE user_id = NEW.user_id) >= 5 THEN
      INSERT INTO user_banners (user_id, banner_id, unlocked_at)
      VALUES (NEW.user_id, 'madrugador', NOW())
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_early_message_stats
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_early_message_stats();
```

#### Paso 5: Agregar lógica de progreso al hook
```javascript
// En useBannerStats.tsx, dentro de getBannerProgress()
case 'madrugador':
  return {
    current: stats.early_messages_total || 0,        // Mensajes de madrugada actuales
    max: 5,                                          // Necesarios para desbloquear
    unlocked: isUnlocked,                            // ¿Ya lo tiene?
    description: `${stats.early_messages_total || 0}/5 mensajes antes de las 6 AM`
  };
```

#### Paso 6: Agregar lógica de activación automática (opcional)
```javascript
// En useAutomaticBanners.tsx, si queremos versión automática también
const earlyMessagesToday = messages.filter(message => {
  const messageDate = new Date(message.created_at);
  const today = new Date();
  const isToday = messageDate.toDateString() === today.toDateString();
  const isEarly = messageDate.getHours() < 6;
  const isFromUser = message.user_id === currentUserId;
  
  return isToday && isEarly && isFromUser;
}).length;

if (earlyMessagesToday > 0) {
  automaticBanners.push({
    id: 'madrugador-auto',
    name: 'Madrugador Activo',
    emoji: '🌅',
    rarity: 'rare',
    description: `Has enviado ${earlyMessagesToday} mensaje(s) de madrugada hoy`,
    isActive: true
  });
}
```

#### Paso 7: Verificar en la interfaz
```javascript
// En Banners.tsx, el nuevo banner aparecerá automáticamente porque:
// 1. Está en DETAILED_BANNERS
// 2. getBannerProgress() maneja su caso
// 3. El componente mapea todos los banners automáticamente

{DETAILED_BANNERS.map((banner) => {
  const progress = getBannerProgress(banner.id);  // Incluye 'madrugador'
  return (
    <BannerCard
      key={banner.id}
      banner={banner}
      isUnlocked={progress.unlocked}
      progress={progress.current}      // 0-5
      maxProgress={progress.max}       // 5
      description={progress.description} // "X/5 mensajes antes de las 6 AM"
    />
  );
})}
```

### 🧪 Pruebas

#### Cómo probar el nuevo banner:

1. **Simular hora de madrugada en base de datos:**
```sql
-- Insertar mensaje con timestamp de madrugada
INSERT INTO messages (id, content, user_id, room_id, created_at)
VALUES (gen_random_uuid(), 'Mensaje de prueba', 'tu-user-id', 'room-id', '2024-01-01 05:30:00');
```

2. **Verificar que se actualizó la estadística:**
```sql
SELECT early_messages_total FROM user_stats WHERE user_id = 'tu-user-id';
-- Debería mostrar 1
```

3. **Repetir hasta llegar a 5 mensajes**

4. **Verificar que se otorgó el banner:**
```sql
SELECT * FROM user_banners WHERE user_id = 'tu-user-id' AND banner_id = 'madrugador';
-- Debería mostrar el registro del banner
```

5. **Verificar en la interfaz:**
- Ir a `/banners`
- Buscar "Madrugador" en la sección "Misiones"
- Debería mostrar "✅ Desbloqueado"

---

## 🐛 Cómo Debuggear Problemas

### Problema 1: "El banner no aparece aunque cumplí la condición"

#### ✅ Verificar la base de datos:
```sql
-- 1. ¿Se guardó el mensaje?
SELECT * FROM messages WHERE user_id = 'tu-user-id' ORDER BY created_at DESC LIMIT 5;

-- 2. ¿Se actualizó la estadística?
SELECT * FROM user_stats WHERE user_id = 'tu-user-id';

-- 3. ¿Se ejecutó el trigger?
SELECT * FROM user_banners WHERE user_id = 'tu-user-id' AND banner_id = 'banner-esperado';
```

#### ✅ Verificar el frontend:
```javascript
// En useBannerStats.tsx, agregar logs
console.log('Stats cargadas:', stats);
console.log('Banners del usuario:', userBanners);
console.log('Progreso calculado:', getBannerProgress('banner-esperado'));

// En BannerCard.tsx
console.log('Renderizando banner:', banner.id, 'Desbloqueado:', isUnlocked);
```

#### ✅ Verificar hooks:
```javascript
// En useChat.tsx
console.log('Enviando mensaje:', content);
console.log('Respuesta de supabase:', data, error);

// En useBannerStats.tsx
useEffect(() => {
  console.log('Usuario cambió, recargando stats:', user?.id);
}, [user]);
```

### Problema 2: "Banner automático no se activa en tiempo real"

#### ✅ Verificar datos de entrada:
```javascript
// En useAutomaticBanners.tsx
console.log('Mensajes recibidos:', messages.length);
console.log('Usuario actual:', currentUserId);
console.log('Ejemplo de mensaje:', messages[0]);
```

#### ✅ Verificar cálculos:
```javascript
// Dentro del useMemo
console.log('Estadísticas calculadas:', userStats);
console.log('Campeón actual:', topUser);
console.log('¿Aplica al usuario actual?', topUser.userId === currentUserId);
```

#### ✅ Verificar dependencias:
```javascript
// Verificar que useMemo se ejecuta cuando debe
const automaticBanners = useMemo(() => {
  console.log('🔄 Recalculando banners automáticos');
  // ... lógica
}, [messages, currentUserId]);  // ¿Están correctas las dependencias?
```

### Problema 3: "Error al canjear código secreto"

#### ✅ Verificar el código:
```javascript
// En useBannerStats.tsx
const redeemSecretCode = async (code) => {
  console.log('Canjeando código:', code);
  console.log('Usuario actual:', user?.id);
  
  try {
    const { data, error } = await supabase.rpc('award_banner_with_code', {
      p_user_id: user.id,
      p_code: code.trim()
    });
    
    console.log('Respuesta RPC:', { data, error });
    
  } catch (error) {
    console.error('Error en RPC:', error);
  }
};
```

#### ✅ Verificar función RPC en base de datos:
```sql
-- Probar la función directamente
SELECT award_banner_with_code('tu-user-id', 'REY_DEL_TODO_2025');
-- Debería devolver TRUE

-- Verificar que existe la función
SELECT * FROM pg_proc WHERE proname = 'award_banner_with_code';
```

### Problema 4: "Los cambios no se ven en tiempo real"

#### ✅ Verificar suscripciones de Supabase:
```javascript
// En useChat.tsx
useEffect(() => {
  console.log('🔌 Configurando suscripción a mensajes');
  
  const subscription = supabase
    .from('messages')
    .on('INSERT', (payload) => {
      console.log('📨 Nuevo mensaje recibido:', payload.new);
      setMessages(prev => [...prev, payload.new]);
    })
    .subscribe();
    
  return () => {
    console.log('🔌 Limpiando suscripción');
    subscription.unsubscribe();
  };
}, []);
```

#### ✅ Verificar estados de React:
```javascript
// Verificar que los estados se actualizan
useEffect(() => {
  console.log('📊 Messages actualizado:', messages.length);
}, [messages]);

useEffect(() => {
  console.log('🏆 UserBanners actualizado:', userBanners.length);
}, [userBanners]);
```

### 🛠️ Herramientas útiles para debugging:

#### 1. **Console del navegador:**
- Abrir DevTools (F12)
- Ir a "Console"
- Ver los logs que agregaste en el código

#### 2. **Network tab:**
- Ver las llamadas a Supabase
- Verificar que se envían los datos correctos
- Revisar errores de conexión

#### 3. **Supabase Dashboard:**
- Ir a [app.supabase.com](https://app.supabase.com)
- Verificar datos en "Table Editor"
- Ejecutar queries en "SQL Editor"

#### 4. **React Developer Tools:**
- Extensión de Chrome/Firefox
- Ver estados de componentes
- Verificar props que se pasan

### 🎯 Checklist de debugging:

#### Para banners que no aparecen:
- [ ] ¿Está el banner en `bannerData.ts`?
- [ ] ¿Maneja `getBannerProgress()` este banner?
- [ ] ¿Se ejecutó el trigger de base de datos?
- [ ] ¿Se actualizó `user_stats`?
- [ ] ¿Se insertó en `user_banners`?
- [ ] ¿Se recargaron los datos en el frontend?

#### Para banners automáticos:
- [ ] ¿Están llegando los mensajes correctos?
- [ ] ¿Es correcto el `currentUserId`?
- [ ] ¿Se ejecuta el `useMemo`?
- [ ] ¿La lógica de cálculo es correcta?
- [ ] ¿Se renderiza el componente con los banners?

#### Para códigos secretos:
- [ ] ¿Existe la función RPC en base de datos?
- [ ] ¿El código está en la función RPC?
- [ ] ¿Se llama correctamente desde frontend?
- [ ] ¿El usuario no tiene ya el banner?
- [ ] ¿Se recargan los banners después del canje?

¡Con esta guía paso a paso ya puedes entender, modificar y debuggear todo el sistema de banners! 🚀