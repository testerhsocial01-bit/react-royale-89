import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, MessageSquare, Award, Settings, LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface MobileMenuProps {
  roomId?: string;
}

export const MobileMenu = ({ roomId }: MobileMenuProps) => {
  const { user, signOut } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] bg-card">
        <SheetHeader className="text-left">
          <SheetTitle className="text-foreground">Menú</SheetTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="text-lg">{user?.user_metadata?.avatar_emoji || '🧑‍💻'}</span>
            <span>{user?.user_metadata?.name || user?.email}</span>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col gap-2 mt-6">
          {roomId && (
            <Button variant="ghost" asChild className="justify-start">
              <Link to="/" className="flex items-center gap-3">
                <Home className="h-5 w-5" />
                Chat Principal
              </Link>
            </Button>
          )}
          
          <Button variant="ghost" asChild className="justify-start">
            <Link to="/profile" className="flex items-center gap-3">
              <User className="h-5 w-5" />
              Mi Perfil
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="justify-start">
            <Link to="/rooms" className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5" />
              Salas de Chat
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="justify-start">
            <Link to="/banners" className="flex items-center gap-3">
              <Award className="h-5 w-5" />
              Mis Banners
            </Link>
          </Button>
          
          <div className="border-t border-border my-2" />
          
          <Button variant="ghost" className="justify-start" disabled>
            <Settings className="h-5 w-5 mr-3" />
            Configuración
          </Button>
          
          <Button variant="ghost" onClick={signOut} className="justify-start text-destructive hover:text-destructive">
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};