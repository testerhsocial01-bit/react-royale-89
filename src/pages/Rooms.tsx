import { useRooms } from "@/hooks/useRooms";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MessageSquare, Users, Plus, ArrowLeft, Lock } from "lucide-react";

const Rooms = () => {
  const { user } = useAuth();
  const { rooms, loading, createRoom, joinRoom } = useRooms();
  const [isCreating, setIsCreating] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    isPrivate: false
  });

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim()) return;
    
    const success = await createRoom(newRoom.name, newRoom.description, newRoom.isPrivate);
    if (success) {
      setNewRoom({ name: '', description: '', isPrivate: false });
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    await joinRoom(roomId);
  };

  if (loading) {
    return (
      <div className="min-h-screen chat-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando salas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen chat-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al chat
            </Link>
          </Button>

          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Sala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Sala</DialogTitle>
                <DialogDescription>
                  Crea tu propia sala de chat para conversar con otros usuarios.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomName">Nombre de la sala</Label>
                  <Input
                    id="roomName"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Sala de Gaming"
                  />
                </div>
                <div>
                  <Label htmlFor="roomDescription">Descripción (opcional)</Label>
                  <Textarea
                    id="roomDescription"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe de qué trata tu sala..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newRoom.isPrivate}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <Label htmlFor="isPrivate" className="text-sm">
                    Sala privada (solo por invitación)
                  </Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateRoom} className="flex-1">
                    Crear Sala
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Salas de Chat</h1>
          <p className="text-muted-foreground">
            Únete a conversaciones existentes o crea tu propia sala
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isMember = room.members?.some((member: any) => member.id === user?.id);
            
            return (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {room.is_private && <Lock className="h-4 w-4" />}
                        {room.name}
                      </CardTitle>
                      {room.description && (
                        <CardDescription className="mt-2">
                          {room.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Room Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.member_count || 0} miembros</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{room.message_count || 0} mensajes</span>
                      </div>
                    </div>

                    {/* Room Owner */}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Creado por: </span>
                      <span className="font-medium">{room.created_by_name || 'Usuario'}</span>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {isMember ? (
                        <Button asChild className="w-full">
                          <Link to={`/chat/${room.id}`}>
                            Entrar a la sala
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={room.is_private}
                        >
                          {room.is_private ? 'Privada' : 'Unirse'}
                        </Button>
                      )}
                    </div>

                    {/* Room Type Badge */}
                    <div>
                      <Badge variant={room.is_private ? "destructive" : "secondary"}>
                        {room.is_private ? 'Privada' : 'Pública'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {rooms.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No hay salas disponibles</h3>
              <p className="text-muted-foreground mb-6">
                ¡Sé el primero en crear una sala de chat!
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Sala
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Rooms;