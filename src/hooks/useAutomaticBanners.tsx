import { useState, useEffect } from 'react';
import { Banner } from '@/types/chat';
import { DETAILED_BANNERS } from '@/data/bannerData';

/**
 * Hook para calcular banners automáticos basados en reacciones del chat
 */
export const useAutomaticBanners = (messages: any[]) => {
  const [automaticBanners, setAutomaticBanners] = useState<{ userId: string; banner: Banner }[]>([]);

  useEffect(() => {
    if (!messages || messages.length === 0) {
      setAutomaticBanners([]);
      return;
    }

    // Calcular estadísticas por usuario
    const userStats: Record<string, {
      hearts: number;
      laughs: number;
      ideas: number;
      poops: number;
      fires: number;
      total: number;
    }> = {};

    // Analizar las reacciones de los últimos 20 mensajes
    const recentMessages = messages.slice(-20);
    
    recentMessages.forEach(message => {
      if (!message.user_id || !message.reactions) return;
      
      if (!userStats[message.user_id]) {
        userStats[message.user_id] = {
          hearts: 0,
          laughs: 0,
          ideas: 0,
          poops: 0,
          fires: 0,
          total: 0
        };
      }

      // Contar reacciones por emoji
      Object.entries(message.reactions).forEach(([emoji, data]: [string, any]) => {
        const count = data.count || 0;
        userStats[message.user_id].total += count;

        switch (emoji) {
          case '❤️':
            userStats[message.user_id].hearts += count;
            break;
          case '😂':
            userStats[message.user_id].laughs += count;
            break;
          case '💡':
            userStats[message.user_id].ideas += count;
            break;
          case '💩':
            userStats[message.user_id].poops += count;
            break;
          case '🔥':
            userStats[message.user_id].fires += count;
            break;
        }
      });
    });

    // Determinar ganadores de cada categoría
    const banners: { userId: string; banner: Banner }[] = [];

    // El más adorado (más ❤️)
    const mostLovedUser = Object.entries(userStats).reduce((max, [userId, stats]) => 
      stats.hearts > max.hearts ? { userId, hearts: stats.hearts } : max, 
      { userId: '', hearts: 0 }
    );

    if (mostLovedUser.hearts >= 3) {
      const adoradoBanner = DETAILED_BANNERS.find(b => b.id === 'adorado');
      if (adoradoBanner) {
        banners.push({ userId: mostLovedUser.userId, banner: adoradoBanner });
      }
    }

    // El más popular (más reacciones totales)
    const mostPopularUser = Object.entries(userStats).reduce((max, [userId, stats]) => 
      stats.total > max.total ? { userId, total: stats.total } : max, 
      { userId: '', total: 0 }
    );

    if (mostPopularUser.total >= 5 && mostPopularUser.userId !== mostLovedUser.userId) {
      const popularBanner = DETAILED_BANNERS.find(b => b.id === 'popular');
      if (popularBanner) {
        banners.push({ userId: mostPopularUser.userId, banner: popularBanner });
      }
    }

    // El cacas (más 💩)
    const mostPoopUser = Object.entries(userStats).reduce((max, [userId, stats]) => 
      stats.poops > max.poops ? { userId, poops: stats.poops } : max, 
      { userId: '', poops: 0 }
    );

    if (mostPoopUser.poops >= 2) {
      const cacasBanner = DETAILED_BANNERS.find(b => b.id === 'cacas');
      if (cacasBanner) {
        banners.push({ userId: mostPoopUser.userId, banner: cacasBanner });
      }
    }

    // El más inteligente (más 💡)
    const smartestUser = Object.entries(userStats).reduce((max, [userId, stats]) => 
      stats.ideas > max.ideas ? { userId, ideas: stats.ideas } : max, 
      { userId: '', ideas: 0 }
    );

    if (smartestUser.ideas >= 2) {
      const coquitoBanner = DETAILED_BANNERS.find(b => b.id === 'coquito');
      if (coquitoBanner) {
        banners.push({ userId: smartestUser.userId, banner: coquitoBanner });
      }
    }

    setAutomaticBanners(banners);
  }, [messages]);

  // Función para obtener banners automáticos de un usuario específico
  const getUserAutomaticBanners = (userId: string): Banner[] => {
    return automaticBanners
      .filter(ab => ab.userId === userId)
      .map(ab => ab.banner);
  };

  return {
    automaticBanners,
    getUserAutomaticBanners
  };
};