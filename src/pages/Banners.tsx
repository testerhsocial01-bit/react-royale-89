import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BannerCard } from '@/components/BannerCard';
import { DETAILED_BANNERS } from '@/data/bannerData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trophy, Zap, Crown, Gift } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useBannerStats } from '@/hooks/useBannerStats';

const Banners = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { stats, userBanners, loading, getBannerProgress, redeemSecretCode } = useBannerStats();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [secretCode, setSecretCode] = useState('');
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);

  const handleRedeemCode = async () => {
    if (!secretCode.trim()) return;
    
    setIsRedeemingCode(true);
    const success = await redeemSecretCode(secretCode);
    if (success) {
      setSecretCode('');
    }
    setIsRedeemingCode(false);
  };

  const filterBanners = (category: string) => {
    if (category === 'all') return DETAILED_BANNERS;
    return DETAILED_BANNERS.filter(banner => banner.category === category);
  };

  const filteredBanners = filterBanners(selectedCategory);

  const automaticBanners = DETAILED_BANNERS.filter(b => b.category === 'automatic');
  const unlockableBanners = DETAILED_BANNERS.filter(b => b.category === 'unlockable');
  const exclusiveBanners = DETAILED_BANNERS.filter(b => b.category === 'exclusive');

  const unlockedCount = userBanners.length;

  if (loading) {
    return (
      <div className="min-h-screen chat-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen chat-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al chat
            </Link>
          </Button>
        </div>

        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              🏷️ Sistema de Banners
              <Badge className="bg-primary text-primary-foreground">
                {unlockedCount}/{DETAILED_BANNERS.length} Desbloqueados
              </Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              Colecciona banners enviando mensajes, recibiendo reacciones y completando misiones especiales. 
              Puedes equipar hasta 3 banners a la vez en tu perfil.
            </p>
          </CardHeader>
        </Card>

        {/* Banner Categories */}
        <Tabs defaultValue="automatic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="automatic" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automáticos
            </TabsTrigger>
            <TabsTrigger value="unlockable" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Misiones
            </TabsTrigger>
            <TabsTrigger value="exclusive" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Exclusivos
            </TabsTrigger>
            <TabsTrigger value="all">
              Todos
            </TabsTrigger>
          </TabsList>

          {/* Automatic Banners */}
          <TabsContent value="automatic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  🌟 Banners Automáticos ({automaticBanners.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Estos se activan dinámicamente mientras cumples la condición. 
                  Desaparecen solos si dejas de cumplir la condición.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {automaticBanners.map((banner) => {
                    const progress = getBannerProgress(banner.id);
                    return (
                      <BannerCard
                        key={banner.id}
                        banner={banner}
                        isUnlocked={progress.unlocked}
                        progress={progress.current}
                        maxProgress={progress.max}
                        description={progress.description}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unlockable Banners */}
          <TabsContent value="unlockable" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-500" />
                  🏆 Banners por Misiones ({unlockableBanners.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Estos los desbloqueas permanentemente y puedes equiparlos. 
                  Máximo 3 banners equipados en tu perfil.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockableBanners.map((banner) => {
                    const progress = getBannerProgress(banner.id);
                    return (
                      <BannerCard
                        key={banner.id}
                        banner={banner}
                        isUnlocked={progress.unlocked}
                        progress={progress.current}
                        maxProgress={progress.max}
                        description={progress.description}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exclusive Banners */}
          <TabsContent value="exclusive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  🎖️ Banners Exclusivos ({exclusiveBanners.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Los más raros y difíciles de conseguir. Algunos tienen efectos visuales especiales.
                </p>
                
                {/* Secret Code Section */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Código Secreto</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    ¿Tienes un código especial? Úsalo aquí para desbloquear banners exclusivos.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ingresa tu código secreto..."
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRedeemCode()}
                    />
                    <Button 
                      onClick={handleRedeemCode}
                      disabled={!secretCode.trim() || isRedeemingCode}
                    >
                      {isRedeemingCode ? 'Canjeando...' : 'Canjear'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exclusiveBanners.map((banner) => {
                    const progress = getBannerProgress(banner.id);
                    return (
                      <BannerCard
                        key={banner.id}
                        banner={banner}
                        isUnlocked={progress.unlocked}
                        progress={progress.current}
                        maxProgress={progress.max}
                        description={progress.description}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Banners */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {DETAILED_BANNERS.map((banner) => {
                const progress = getBannerProgress(banner.id);
                return (
                  <BannerCard
                    key={banner.id}
                    banner={banner}
                    isUnlocked={progress.unlocked}
                    progress={progress.current}
                    maxProgress={progress.max}
                    description={progress.description}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* How to Use */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📱 Cómo funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  En el Chat
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Los banners aparecen como pequeños textos con íconos al lado de tu nombre</li>
                  <li>• Los banners dinámicos se muestran automáticamente</li>
                  <li>• El "Fundador y Rey del Todo" tiene efectos visuales animados</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  En tu Perfil
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Puedes coleccionar todos los banners</li>
                  <li>• Solo puedes equipar 3 banners a la vez</li>
                  <li>• Los demás quedan guardados en tu colección</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Banners;