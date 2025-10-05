import React from 'react';
import { Heart, BookOpen } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
      <div className="text-center space-y-8 px-8">
        {/* Logo/Icon Animation */}
        <div className="relative">
          <div className="animate-bounce">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <BookOpen size={32} className="text-white" />
            </div>
          </div>
          
          {/* Floating Hearts */}
          <div className="absolute -top-4 -right-4 animate-pulse">
            <Heart size={16} className="text-red-400 fill-current" />
          </div>
          <div className="absolute -bottom-2 -left-4 animate-pulse delay-300">
            <Heart size={12} className="text-pink-400 fill-current" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 opacity-0 animate-fade-in-up">
            Ministério Infantil
          </h1>
          <p className="text-gray-600 opacity-0 animate-fade-in-up-delay">
            Carregando sistema...
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Inspirational Text */}
        <p className="text-sm text-gray-500 italic opacity-0 animate-fade-in-up-delay-2">
          "Deixai vir a mim os pequeninos..." - Mateus 19:14
        </p>
      </div>
    </div>
  );
};