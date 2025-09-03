import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAchievements } from "@/hooks/useAchievements";
import { useBanners } from "@/hooks/useBanners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AvatarSelector } from "@/components/AvatarSelector";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Heart, Crown, MessageSquare, ArrowLeft, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRarityColor } from "@/data/achievements";

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, loading, updateProfile } = useProfile(userId || user?.id || '');
  const { userBanners, loading: bannersLoading, toggleBannerVisibility } = useBanners();
  const { 
    loading: achievementsLoading, 
    toggleAchievement, 
    getUnlockedAchievements, 
    getActiveAchievements 
  } = useAchievements();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    avatar_emoji: ''
  });

  const isOwnProfile = !userId || userId === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen chat-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen chat-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Perfil no encontrado</p>
            <Button asChild className="mt-4">
              <Link to="/">Volver al chat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEditStart = () => {
    setEditData({
      name: profile.name || '',
      bio: profile.bio || '',
      avatar_emoji: profile.avatar_emoji || '🧑‍💻'
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile(editData);
    setIsEditing(false);
  };

  const unlockedAchievements = getUnlockedAchievements();
  const activeAchievements = getActiveAchievements();

  return (
    <div className="min-h-screen chat-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al chat
            </Link>
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center space-y-4">
                <AvatarSelector
                  currentAvatar={profile.avatar_emoji || '🧑‍💻'}
                  onSelect={(emoji) => {
                    if (isOwnProfile) {
                      updateProfile({ avatar_emoji: emoji });
                    }
                  }}
                >
                  <div className="cursor-pointer group">
                    <div className="text-6xl transition-transform group-hover:scale-110">
                      {profile.avatar_emoji || '🧑‍💻'}
                    </div>
                    {isOwnProfile && (
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        Click para cambiar
                      </p>
                    )}
                  </div>
                </AvatarSelector>
                
                {/* Active Achievements */}
                {activeAchievements.slice(0, 3).map((achievement) => (
                  <Badge 
                    key={achievement.id} 
                    className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white px-3 py-1 mb-2`}
                  >
                    {achievement.emoji} {achievement.name}
                  </Badge>
                ))}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                {isEditing && isOwnProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="avatar">Avatar</Label>
                      <AvatarSelector
                        currentAvatar={editData.avatar_emoji}
                        onSelect={(emoji) => setEditData(prev => ({ ...prev, avatar_emoji: emoji }))}
                      >
                        <Button variant="outline" className="w-full">
                          <span className="text-2xl mr-2">{editData.avatar_emoji}</span>
                          Cambiar Avatar
                        </Button>
                      </AvatarSelector>
                    </div>
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Cuéntanos sobre ti..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave}>Guardar</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold">{profile.name || 'Usuario'}</h1>
                      {isOwnProfile && (
                        <Button variant="outline" onClick={handleEditStart}>
                          Editar perfil
                        </Button>
                      )}
                    </div>
                    
                    {profile.bio && (
                      <p className="text-muted-foreground">{profile.bio}</p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        <span className="font-semibold">{profile.likes}</span>
                        <span className="text-sm text-muted-foreground">likes</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">{profile.message_count || 0}</span>
                        <span className="text-sm text-muted-foreground">mensajes</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">{profile.total_reactions || 0}</span>
                        <span className="text-sm text-muted-foreground">reacciones</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Banners Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="h-5 w-5" />
              Mis Banners
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!bannersLoading && userBanners?.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona hasta 3 banners para mostrar en tu perfil:
                </p>
                <div className="grid gap-3">
                  {userBanners.map((userBanner: any) => (
                    <div
                      key={userBanner.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        userBanner.is_active 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted-foreground/20 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{userBanner.banners?.emoji}</div>
                          <div>
                            <div className="font-semibold">{userBanner.banners?.name}</div>
                            <div className="text-sm text-muted-foreground">{userBanner.banners?.description}</div>
                          </div>
                        </div>
                        {isOwnProfile && (
                          <Switch
                            checked={userBanner.is_active}
                            onCheckedChange={(checked) => toggleBannerVisibility(userBanner.id, checked)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-4 border-t border-muted">
                  <p className="text-sm text-muted-foreground">
                    Banners activos: {userBanners.filter((ub: any) => ub.is_active).length}/3
                  </p>
                </div>
              </div>
            ) : bannersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando banners...</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isOwnProfile ? 'Aún no tienes banners. ¡Participa en el chat para ganar algunos!' : 'Este usuario no tiene banners'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Achievements Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Colección de Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || achievementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando logros...</p>
              </div>
            ) : unlockedAchievements.length > 0 ? (
              <div className="space-y-4">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white relative`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{achievement.emoji}</div>
                        <div>
                          <div className="font-semibold">{achievement.name}</div>
                          <div className="text-sm opacity-90">{achievement.description}</div>
                          <div className="text-xs opacity-70 capitalize">{achievement.rarity}</div>
                        </div>
                      </div>
                      
                      {isOwnProfile && (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`achievement-${achievement.id}`} className="text-sm">
                            {achievement.isActive ? 'Visible' : 'Oculto'}
                          </Label>
                          <Switch
                            id={`achievement-${achievement.id}`}
                            checked={achievement.isActive}
                            onCheckedChange={(checked) => toggleAchievement(achievement.id, checked)}
                            className="data-[state=checked]:bg-white/30"
                          />
                        </div>
                      )}
                    </div>
                    
                    {achievement.isActive && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white"></div>
                    )}
                  </div>
                ))}
                
                {isOwnProfile && (
                  <div className="text-center pt-4 border-t border-muted">
                    <p className="text-sm text-muted-foreground">
                      Máximo 3 logros visibles ({activeAchievements.length}/3)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isOwnProfile ? 'Aún no tienes logros desbloqueados' : 'Este usuario no tiene logros'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;