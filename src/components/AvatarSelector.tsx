import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AvatarSelectorProps {
  currentAvatar?: string;
  onSelect: (emoji: string) => void;
  children: React.ReactNode;
}

const AVATAR_EMOJIS = [
  // Profesionales y Trabajadores
  '🧑‍💻', '👩‍💻', '🧑‍💼', '👩‍💼', '🧑‍🔬', '👩‍🔬', 
  '🧑‍⚕️', '👩‍⚕️', '🧑‍🎓', '👩‍🎓', '🧑‍🏫', '👩‍🏫',
  '🧑‍⚖️', '👩‍⚖️', '🧑‍🌾', '👩‍🌾', '🧑‍🍳', '👩‍🍳',
  
  // Creativos y Artistas
  '🧑‍🎨', '👩‍🎨', '🧑‍🎤', '👩‍🎤', '🧑‍🎭', '👩‍🎭',
  '🧑‍🎪', '👩‍🎪', '🧑‍🎵', '👩‍🎵', '🧑‍🎸', '👩‍🎸',
  
  // Deportistas y Activos
  '🧑‍⚽', '👩‍⚽', '🧑‍🏀', '👩‍🏀', '🧑‍🏈', '👩‍🏈',
  '🧑‍🎾', '👩‍🎾', '🧑‍🏊', '👩‍🏊', '🧑‍🚴', '👩‍🚴',
  
  // Aventureros y Fantásticos
  '🧙‍♂️', '🧙‍♀️', '🧝‍♂️', '🧝‍♀️', '🧚‍♂️', '🧚‍♀️',
  '🧛‍♂️', '🧛‍♀️', '🧞‍♂️', '🧞‍♀️', '🦸‍♂️', '🦸‍♀️',
  '🦹‍♂️', '🦹‍♀️', '🧑‍🚀', '👩‍🚀', '🧑‍✈️', '👩‍✈️',
  
  // Clásicos y Diversos
  '👨', '👩', '🧑', '👴', '👵', '🧓', '👶',
  '🤴', '👸', '🤵', '👰', '🤰', '🤱', '👼',
  '🕴️', '💂‍♂️', '💂‍♀️', '🕵️‍♂️', '🕵️‍♀️', '💆‍♂️', '💆‍♀️',
  
  // Animales y Criaturas
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻',
  '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
  '🐙', '🦄', '🐉', '🦋', '🐝', '🦉', '🐺'
];

export const AvatarSelector = ({ currentAvatar = '🧑‍💻', onSelect, children }: AvatarSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Elige tu Avatar</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="grid grid-cols-6 gap-2 p-2">
            {AVATAR_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant={emoji === currentAvatar ? "default" : "ghost"}
                size="sm"
                className="h-12 w-12 text-xl hover:scale-110 transition-transform"
                onClick={() => handleSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};