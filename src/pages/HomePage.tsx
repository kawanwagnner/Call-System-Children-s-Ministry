import { useState } from 'react';
import { Plus, Users, BookOpen, CheckSquare, BarChart3, Calendar, Clock } from 'lucide-react';
import { LessonForm } from '../components/LessonForm';

interface HomePageProps {
  onNavigate: (page: 'students' | 'lessons' | 'attendance' | 'reports') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [showLessonForm, setShowLessonForm] = useState(false);

  const quickActions = [
    {
      title: 'Nova Aula',
      description: 'Criar uma nova aula rapidamente',
      icon: Plus,
      action: () => setShowLessonForm(true),
      color: 'bg-green-500 hover:bg-green-600',
      iconColor: 'text-white'
    },
    {
      title: 'Fazer Chamada',
      description: 'Registrar presença dos alunos',
      icon: CheckSquare,
      action: () => onNavigate('attendance'),
      color: 'bg-blue-500 hover:bg-blue-600',
      iconColor: 'text-white'
    },
    {
      title: 'Ver Aulas',
      description: 'Gerenciar aulas cadastradas',
      icon: BookOpen,
      action: () => onNavigate('lessons'),
      color: 'bg-purple-500 hover:bg-purple-600',
      iconColor: 'text-white'
    },
    {
      title: 'Alunos',
      description: 'Gerenciar cadastro de alunos',
      icon: Users,
      action: () => onNavigate('students'),
      color: 'bg-orange-500 hover:bg-orange-600',
      iconColor: 'text-white'
    }
  ];

  const handleLessonFormClose = () => {
    setShowLessonForm(false);
  };

  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Ministério Infantil
        </h1>
        <p className="text-lg text-gray-600 flex items-center justify-center gap-2">
          <Calendar size={20} />
          {today}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} rounded-2xl p-6 text-left transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={32} className={action.iconColor} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-white/90 text-sm">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Alunos</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500">Total cadastrados</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={24} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Aulas</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500">Total cadastradas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Última Aula</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500">Data da última aula</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Atividade Recente</h2>
          <button
            onClick={() => onNavigate('reports')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            <BarChart3 size={20} />
            Ver Relatórios
          </button>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-center py-8">
            Nenhuma atividade recente
          </p>
        </div>
      </div>

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <LessonForm
          lesson={null}
          onClose={handleLessonFormClose}
        />
      )}
    </div>
  );
}