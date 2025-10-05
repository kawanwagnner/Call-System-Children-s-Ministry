import React from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl'
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '', 
  onClick 
}) => {
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (name: string) => {
    // Generate consistent color based on name
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const baseClasses = `
    relative inline-flex items-center justify-center 
    rounded-full overflow-hidden font-medium text-white
    transition-all duration-200 
    ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
    ${sizeClasses[size]} 
    ${className}
  `;

  if (src) {
    return (
      <div className={baseClasses} onClick={onClick}>
        <img
          src={src}
          alt={`Foto de ${name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show fallback
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback initials (hidden when image loads successfully) */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            ${getBackgroundColor(name)}
          `}
          style={{ zIndex: -1 }}
        >
          {getInitials(name)}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${getBackgroundColor(name)}`}
      onClick={onClick}
    >
      {getInitials(name)}
    </div>
  );
};