import { useState, useEffect } from 'react';
import { Plus, Users, BookOpen, CheckSquare, BarChart3, Calendar, Clock } from 'lucide-react';
import { LessonForm } from '../components/LessonForm';
import { supabase } from '../lib/supabase';

interface HomePageProps {
  onNavigate: (page: 'students' | 'lessons' | 'attendance' | 'reports') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLessons: 0,
    lastLessonDate: null as string | null
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const { data: recentLessons } = await supabase
        .from('lessons')
        .select(`
          *,
          attendance(count)
        `)
        .order('date', { ascending: false })
        .limit(5);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalLessons: lessonsRes.count || 0,
        lastLessonDate: (recentLessonsRes.data as any)?.[0]?.date || null
      });

      setRecentActivity(recentLessons || []);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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
    loadDashboardData(); // Recarrega dados quando uma aula é criada
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
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats.totalStudents}
            </p>
            <p className="text-sm text-gray-500">Total cadastrados</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={24} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Aulas</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats.totalLessons}
            </p>
            <p className="text-sm text-gray-500">Total cadastradas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Última Aula</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {loading ? '...' : 
                stats.lastLessonDate 
                  ? new Date(stats.lastLessonDate).toLocaleDateString('pt-BR')
                  : 'Nenhuma'
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
          ) : recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma atividade recente
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((lesson: any) => (
                <div key={lesson.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(lesson.date).toLocaleDateString('pt-BR')}
                        {lesson.teacher && ` • Professor: ${lesson.teacher}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {lesson.attendance?.length || 0} presenças
                  </div>
                </div>
              ))}
            </div>
          )}
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