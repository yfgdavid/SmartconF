import { RefreshCw } from 'lucide-react';
import { cn } from '../components/ui/utils';

interface SyncIndicatorProps {
  lastSync?: Date;
  className?: string;
}

export function SyncIndicator({ lastSync, className }: SyncIndicatorProps) {
  const getTimeSinceSync = () => {
    if (!lastSync) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 5) return 'Agora';
    if (diffSec < 60) return `${diffSec}s atrás`;
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}min atrás`;
    
    return lastSync.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <RefreshCw className="h-3 w-3 animate-spin-slow" />
      <span>Última atualização: {getTimeSinceSync()}</span>
    </div>
  );
}
