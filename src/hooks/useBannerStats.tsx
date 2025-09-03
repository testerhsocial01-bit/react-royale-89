import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para manejar estadísticas de banners y banners permanentes
 * 
 * 🎯 ¿Qué hace?
 * - Lee estadísticas del usuario desde la base de datos
 * - Obtiene la lista de banners que el usuario ha desbloqueado
 * - Calcula el progreso hacia nuevos banners
 * - Maneja códigos secretos para banners exclusivos
 * 
 * 📊 Datos que maneja:
 * - UserStats: estadísticas completas del usuario (mensajes, reacciones, rachas)
 * - DailyStats: estadísticas diarias para cálculos específicos
 * - UserBanners: banners permanentes desbloqueados
 * - BannerProgress: progreso hacia banners específicos
 */

// Estadísticas generales del usuario almacenadas en la base de datos
interface UserStats {
  messages_sent_total: number;
  reactions_received_total: number;
  hearts_total: number;
  laughs_total: number;
  ideas_total: number;
  poops_total: number;
  streak_current_days: number;
  streak_longest_days: number;
  last_message_at: string | null;
}

// Estadísticas diarias para cálculos de banners que requieren datos temporales
interface DailyStats {
  day: string;        // Fecha en formato YYYY-MM-DD
  messages: number;   // Mensajes enviados ese día
  hearts: number;     // ❤️ recibidos ese día
  laughs: number;     // 😂 recibidos ese día
  ideas: number;      // 💡 recibidos ese día
  poops: number;      // 💩 recibidos ese día
}

// Información del progreso hacia un banner específico
interface BannerProgress {
  current: number;      // Progreso actual (ej: 75)
  max: number;          // Progreso necesario para desbloquear (ej: 100)  
  unlocked: boolean;    // ¿Ya tiene este banner el usuario?
  description: string;  // Texto explicativo del progreso (ej: "75/100 reacciones recibidas")
}

export const useBannerStats = () => {
  const { user } = useAuth();           // Usuario actual autenticado
  const { toast } = useToast();         // Para mostrar notificaciones
  
  // Estados principales del hook
  const [stats, setStats] = useState<UserStats | null>(null);        // Estadísticas generales
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);    // Estadísticas diarias
  const [userBanners, setUserBanners] = useState<any[]>([]);         // Banners desbloqueados
  const [loading, setLoading] = useState(true);                      // Estado de carga

  /**
   * 🔄 Efecto principal: Cargar datos cuando el usuario cambia
   * Se ejecuta cuando el usuario se loguea/desloguea
   */
  useEffect(() => {
    if (!user) return;    // Si no hay usuario autenticado, no hacer nada

    const loadStats = async () => {
      try {
        // 📊 Cargar estadísticas generales del usuario
        const { data: statsData } = await (supabase as any)
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // 📅 Cargar estadísticas diarias de los últimos 30 días
        // Necesarias para banners que requieren datos temporales
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: dailyData } = await (supabase as any)
          .from('user_daily_stats')
          .select('*')
          .eq('user_id', user.id)
          .gte('day', thirtyDaysAgo.toISOString().split('T')[0])
          .order('day', { ascending: false });

        // 🏆 Cargar banners desbloqueados por el usuario
        // Incluye información completa del banner desde la tabla 'banners'
        const { data: bannersData } = await (supabase as any)
          .from('user_banners')
          .select('*, banners(*)')    // JOIN con tabla de banners
          .eq('user_id', user.id);

        // 📝 Establecer estadísticas (con valores por defecto si no existen)
        setStats(statsData || {
          messages_sent_total: 0,
          reactions_received_total: 0,
          hearts_total: 0,
          laughs_total: 0,
          ideas_total: 0,
          poops_total: 0,
          streak_current_days: 0,
          streak_longest_days: 0,
          last_message_at: null
        });
        
        // 📊 Establecer estadísticas diarias y banners
        setDailyStats(dailyData || []);
        setUserBanners(bannersData || []);
        
      } catch (error: any) {
        console.error('Error loading banner stats:', error);
        // 🚨 Mostrar error al usuario si algo falla
        toast({
          title: "Error al cargar estadísticas",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);    // ✅ Terminar estado de carga
      }
    };

    loadStats();    // 🚀 Ejecutar la carga de datos
  }, [user, toast]);    // Dependencias: se ejecuta cuando user o toast cambian

  /**
   * 📊 Función para calcular el progreso hacia un banner específico
   * 
   * @param bannerId - ID único del banner (ej: 'leyenda', 'goat', etc.)
   * @returns BannerProgress con progreso actual, máximo, estado y descripción
   * 
   * 🎯 ¿Cómo funciona?
   * 1. Verifica si el usuario ya tiene el banner desbloqueado
   * 2. Según el ID del banner, calcula su progreso específico
   * 3. Devuelve información completa para mostrar en la interfaz
   */
  const getBannerProgress = (bannerId: string): BannerProgress => {
    // 🔄 Si no hay estadísticas cargadas, mostrar estado de carga
    if (!stats) {
      return { current: 0, max: 1, unlocked: false, description: 'Cargando...' };
    }

    // ✅ Verificar si el usuario ya tiene este banner desbloqueado
    const isUnlocked = userBanners.some(ub => ub.banner_id === bannerId);
    
    // 🎯 Calcular progreso según el tipo de banner
    switch (bannerId) {
      case 'nuevo-h':    // 🆕 Banner para primer mensaje
        return {
          current: Math.min(stats.messages_sent_total, 1),  // Máximo 1 para el cálculo
          max: 1,                                            // Solo necesita 1 mensaje
          unlocked: isUnlocked,
          description: `${stats.messages_sent_total}/1 mensajes enviados`
        };
        
      case 'leyenda':    // 🏆 Banner para usuarios populares
        return {
          current: stats.reactions_received_total,  // Total de reacciones recibidas
          max: 100,                                 // Necesita 100 reacciones
          unlocked: isUnlocked,
          description: `${stats.reactions_received_total}/100 reacciones recibidas`
        };
        
      case 'goat':       // 🐐 Banner para quien recibe muchos corazones
        return {
          current: stats.hearts_total,    // Total de ❤️ recibidos
          max: 50,                        // Necesita 50 corazones
          unlocked: isUnlocked,
          description: `${stats.hearts_total}/50 ❤️ recibidos`
        };
        
      case 'payaso':
        return {
          current: stats.laughs_total,
          max: 20,
          unlocked: isUnlocked,
          description: `${stats.laughs_total}/20 😂 recibidos`
        };
        
      case 'brujo':
        return {
          current: stats.ideas_total,
          max: 15,
          unlocked: isUnlocked,
          description: `${stats.ideas_total}/15 💡 recibidos`
        };
        
      case 'todo-terreno':    // 🌟 Banner para equilibrio en reacciones
        // Calcula el mínimo entre todos los tipos de reacciones
        const minReactions = Math.min(stats.hearts_total, stats.ideas_total, stats.laughs_total);
        return {
          current: minReactions,    // El progreso es el mínimo de todas
          max: 5,                   // Necesita 5 de cada tipo mínimo
          unlocked: isUnlocked,
          description: `${stats.hearts_total} ❤️, ${stats.ideas_total} 💡, ${stats.laughs_total} 😂 (mín: ${minReactions})`
        };
        
      case 'modo-diablo':
        return {
          current: stats.messages_sent_total,
          max: 200,
          unlocked: isUnlocked,
          description: `${stats.messages_sent_total}/200 mensajes enviados`
        };
        
      case 'constante':
        return {
          current: stats.streak_current_days,
          max: 7,
          unlocked: isUnlocked,
          description: `${stats.streak_current_days}/7 días consecutivos`
        };
        
      case 'inmortal':
        return {
          current: stats.streak_current_days,
          max: 30,
          unlocked: isUnlocked,
          description: `${stats.streak_current_days}/30 días consecutivos`
        };
        
      case 'corazon-oro':    // 💛 Banner para récord diario de corazones
        // Buscar corazones recibidos hoy
        const todayHearts = dailyStats.find(d => d.day === new Date().toISOString().split('T')[0])?.hearts || 0;
        // Encontrar el máximo histórico (incluyendo hoy)
        const maxDailyHearts = Math.max(...dailyStats.map(d => d.hearts), todayHearts);
        return {
          current: maxDailyHearts,    // El récord personal
          max: 20,                    // Necesita 20 ❤️ en un solo día
          unlocked: isUnlocked,
          description: `${maxDailyHearts}/20 ❤️ en un día (máximo alcanzado)`
        };
        
      case 'bello-cur':      // 💖 Banner para popularidad semanal
        // Calcular corazones en los últimos 7 días
        const last7Days = dailyStats.slice(0, 7);    // Los primeros 7 (más recientes)
        const heartsLast7 = last7Days.reduce((sum, day) => sum + day.hearts, 0);
        return {
          current: heartsLast7,     // Corazones en última semana
          max: 25,                  // Necesita 25 ❤️ en 7 días
          unlocked: isUnlocked,
          description: `${heartsLast7}/25 ❤️ en los últimos 7 días`
        };
        
      case 'misterioso':     // 🕵️ Banner especial con lógica compleja
        return {
          current: isUnlocked ? 1 : 0,    // Solo 0 o 1
          max: 1,                         // Banner binario
          unlocked: isUnlocked,
          description: isUnlocked ? 'Desbloqueado' : 'Requiere 7 días sin mensajes + 1 mensaje'
        };
        
      default:              // 🔮 Banners desconocidos o especiales
        return {
          current: 0,
          max: 1,
          unlocked: isUnlocked,
          description: 'Banner especial'
        };
    }
  };

  /**
   * 🔐 Función para canjear códigos secretos
   * 
   * @param code - Código secreto ingresado por el usuario
   * @returns Promise<boolean> - true si se canjeó exitosamente
   * 
   * 🎯 ¿Cómo funciona?
   * 1. Valida que haya usuario logueado y código no vacío
   * 2. Llama a la función RPC de Supabase 'award_banner_with_code'
   * 3. La función RPC verifica el código y otorga el banner si es válido
   * 4. Recarga la lista de banners del usuario
   * 5. Muestra notificación de éxito o error
   */
  const redeemSecretCode = async (code: string): Promise<boolean> => {
    // 🔒 Validaciones básicas
    if (!user || !code.trim()) return false;

    try {
      // 🚀 Llamar a función RPC personalizada en Supabase
      const { data, error } = await (supabase as any)
        .rpc('award_banner_with_code', {
          p_code: code.trim()      // Solo el código, la función obtiene el user_id internamente
        });

      // ❌ Si hay error, el código es incorrecto
      if (error) {
        toast({
          title: "Código incorrecto",
          description: "El código que ingresaste no es válido",
          variant: "destructive",
        });
        return false;
      }

      // ✅ Si hay data, el código fue válido
      if (data) {
        toast({
          title: "¡Banner desbloqueado!",
          description: "Has obtenido el banner 'Fundador y Rey del Todo' 👑🔥",
        });
        
        // 🔄 Recargar banners del usuario para actualizar la interfaz
        const { data: bannersData } = await (supabase as any)
          .from('user_banners')
          .select('*, banners(*)')
          .eq('user_id', user.id);
        
        setUserBanners(bannersData || []);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error redeeming code:', error);
      // 🚨 Error de conexión o similar
      toast({
        title: "Error",
        description: "No se pudo canjear el código",
        variant: "destructive",
      });
      return false;
    }
  };

  // 📤 Exportar todos los datos y funciones que otros componentes necesitan
  return {
    stats,              // Estadísticas generales del usuario
    dailyStats,         // Estadísticas diarias
    userBanners,        // Banners permanentes desbloqueados
    loading,            // Estado de carga
    getBannerProgress,  // Función para calcular progreso de banners
    redeemSecretCode,   // Función para canjear códigos secretos
  };
};