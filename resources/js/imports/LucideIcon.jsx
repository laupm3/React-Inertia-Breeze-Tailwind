import { icons } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';

const Icon = ({ name, color, size, className }) => {
  const LucideIcon = icons[name];

  // Si el icono no existe, usamos un icono predeterminado (AlertTriangle como fallback)
  if (!LucideIcon) {
    return <AlertTriangle color={color} size={size} className={className}/>;
  }

  return <LucideIcon color={color} size={size} className={className}/>;
};

export default Icon;
