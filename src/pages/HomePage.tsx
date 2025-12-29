import { useState, useEffect } from 'react';
import { Plus, Users, BookOpen, CheckSquare, BarChart3, Calendar, Clock, UserCheck, ClipboardList, UserPlus, X } from 'lucide-react';
import { LessonForm } from '../components/LessonForm';
import { supabase } from '../lib/supabase';

interface HomePageProps {
  onNavigate: (page: 'students' | 'lessons' | 'attendance' | 'reports') => void;
  onTabChange?: (tab: 'ministerio' | 'recepcao') => void;
  activeTab?: 'ministerio' | 'recepcao';
}

type TabType = 'ministerio' | 'recepcao';

export function HomePage({ onNavigate, onTabChange, activeTab: propActiveTab = 'ministerio' }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>(propActiveTab);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLessons: 0,
    lastLessonDate: null as string | null
  });

  const [loading, setLoading] = useState(true);

  // Sincronizar com o contexto do App
  useEffect(() => {
    if (propActiveTab !== activeTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab, activeTab]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas
      const [studentsRes, lessonsRes, recentLessonsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('lessons').select('id', { count: 'exact' }),
        supabase.from('lessons').select('*').order('date', { ascending: false }).limit(1)
      ]);

      // Carregar atividade recente (últimas 5 aulas com informações de presença)
      // Esta funcionalidade foi movida para dados estáticos para simplificar

      setStats({
        totalStudents: studentsRes.count || 0,
        totalLessons: lessonsRes.count || 0,
        lastLessonDate: (recentLessonsRes.data as any)?.[0]?.date || null
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const ministerioQuickActions = [
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

  const recepcaoQuickActions = [
    {
      title: 'Novo Visitante',
      description: 'Cadastrar novo visitante',
      icon: UserPlus,
      action: () => onNavigate('students'),
      color: 'bg-teal-500 hover:bg-teal-600',
      iconColor: 'text-white'
    },
    {
      title: 'Check-in Diário',
      description: 'Registrar presenças do dia',
      icon: UserCheck,
      action: () => onNavigate('attendance'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
      iconColor: 'text-white'
    },
    {
      title: 'Lista de Presenças',
      description: 'Ver histórico de presenças',
      icon: ClipboardList,
      action: () => onNavigate('lessons'),
      color: 'bg-rose-500 hover:bg-rose-600',
      iconColor: 'text-white'
    },
    {
      title: 'Membros',
      description: 'Gerenciar informações dos membros',
      icon: Users,
      action: () => onNavigate('students'),
      color: 'bg-gray-500 hover:bg-gray-600',
      iconColor: 'text-white'
    }
  ];

  const handleLessonFormClose = () => {
    setShowLessonForm(false);
    loadDashboardData(); // Recarrega dados quando uma aula é criada
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const renderMinisterioContent = () => (
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
          {ministerioQuickActions.map((action, index) => {
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
              <h3 className="text-lg font-semibold text-gray-900">Membros</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats.totalStudents}
            </p>
            <p className="text-sm text-gray-500">Total cadastrados</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={24} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cultos</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats.totalLessons}
            </p>
            <p className="text-sm text-gray-500">Total cadastradas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Último Culto</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {loading ? '...' : 
                stats.lastLessonDate 
                  ? new Date(stats.lastLessonDate).toLocaleDateString('pt-BR')
                  : '04/10/2025'
              }
            </p>
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
          {loading ? (
            <p className="text-gray-500 text-center py-8">Carregando...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Fruto do Espírito</h4>
                    <p className="text-sm text-gray-500">
                      04/10/2025 • Professor: Kawan
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  1 presenças
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">teste 22</h4>
                    <p className="text-sm text-gray-500">
                      03/10/2025 • Professor: kawan
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  1 presenças
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecepcaoContent = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Recepção
        </h1>
        <p className="text-lg text-gray-600 flex items-center justify-center gap-2">
          <Calendar size={20} />
          Sistema de Chamadas
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recepcaoQuickActions.map((action, index) => {
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
              <UserCheck size={24} className="text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Presentes Hoje</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : '12'}
            </p>
            <p className="text-sm text-gray-500">Pessoas no evento</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <X size={24} className="text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Ausentes Hoje</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : '4'}
            </p>
            <p className="text-sm text-gray-500">Pessoas ausentes</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <UserPlus size={24} className="text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Visitantes</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : '3'}
            </p>
            <p className="text-sm text-gray-500">Novos hoje</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Check-ins Recentes</h2>
          <button
            onClick={() => onNavigate('reports')}
            className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
          >
            <BarChart3 size={20} />
            Ver Relatórios
          </button>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">João Silva</h4>
                  <p className="text-sm text-gray-500">Membro • Check-in: 14:30</p>
                </div>
              </div>
              <div className="text-sm text-teal-600 font-medium">
                Presente
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Maria Santos</h4>
                  <p className="text-sm text-gray-500">Visitante • Check-in: 14:25</p>
                </div>
              </div>
              <div className="text-sm text-indigo-600 font-medium">
                Nova
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Pedro Costa</h4>
                  <p className="text-sm text-gray-500">Membro • Check-in: 14:20</p>
                </div>
              </div>
              <div className="text-sm text-teal-600 font-medium">
                Presente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => handleTabChange('ministerio')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 relative ${
              activeTab === 'ministerio'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Ministério Infantil (preferência salva automaticamente)"
          >
            <BookOpen size={20} />
            Ministério Infantil
            {activeTab === 'ministerio' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" title="Contexto salvo"></div>
            )}
          </button>
          <button
            onClick={() => handleTabChange('recepcao')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 relative ${
              activeTab === 'recepcao'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Recepção (preferência salva automaticamente)"
          >
            <UserCheck size={20} />
            Recepção
            {activeTab === 'recepcao' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" title="Contexto salvo"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'ministerio' ? renderMinisterioContent() : renderRecepcaoContent()}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <LessonForm
          lesson={null}
          onClose={handleLessonFormClose}
          context={activeTab}
        />
      )}
    </div>
  );
}