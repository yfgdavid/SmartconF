import logoFull from 'figma:asset/4abf456c7d4001dbe2cc628960c05c0b96bb880f.png';
import logoCompact from 'figma:asset/4abf456c7d4001dbe2cc628960c05c0b96bb880f.png';

interface ResponsiveLogoProps {
  className?: string;
}

export function ResponsiveLogo({ className = '' }: ResponsiveLogoProps) {
  return (
    <>
      {/* Logo completa para desktop */}
      <img 
        src={logoFull} 
        alt="Smartcon" 
        className={`hidden sm:block ${className}`}
      />
      {/* Logo compacta para mobile */}
      <img 
        src={logoCompact} 
        alt="Smartcon" 
        className={`block sm:hidden ${className}`}
      />
    </>
  );
}
