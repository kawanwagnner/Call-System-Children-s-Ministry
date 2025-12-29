import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';

import { LessonForm } from '../components/LessonForm';
import { useNotificationContext, useConfirmContext } from '../App';

interface LessonsPageProps {
  context?: 'ministerio' | 'recepcao';
}

export function LessonsPage({ context = 'ministerio' }: LessonsPageProps) {
  const { showSuccess, showError } = useNotificationContext();
  const { showConfirm } = useConfirmContext();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  useEffect(() => {
    loadLessons();
  }, [context]);

  const loadLessons = async () => {
    setLoading(true);
    const tableName = context === 'recepcao' ? 'reception_events' : 'lessons';
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .order('date', { ascending: false });

    if (data) setLessons(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const entityName = context === 'recepcao' ? 'evento' : 'aula';
    const confirmed = await showConfirm({
      title: `Excluir ${entityName}`,
      message: `Tem certeza que deseja excluir este ${entityName}? Todos os registros de presença associados também serão excluídos.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (!confirmed) return;

    const tableName = context === 'recepcao' ? 'reception_events' : 'lessons';
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      showError(`Erro ao excluir ${entityName}`, error.message);
    } else {
      showSuccess(`${entityName} excluído com sucesso!`);
      loadLessons();
    }
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLesson(null);
    loadLessons();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Carregando...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {context === 'recepcao' ? 'Eventos' : 'Aulas'}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className={`flex items-center gap-2 px-4 py-2 ${context === 'recepcao' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl transition-colors shadow-sm`}
        >
          <Plus size={20} />
          {context === 'recepcao' ? 'Novo Evento' : 'Nova Aula'}
        </button>
      </div>

      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">{formatDate(lesson.date)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                <div className="space-y-1">
                  {context === 'recepcao' ? (
                    <>
                      {lesson.event_type && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          lesson.event_type === 'Culto' ? 'text-blue-600 bg-blue-50' :
                          lesson.event_type === 'Reunião' ? 'text-green-600 bg-green-50' :
                          'text-purple-600 bg-purple-50'
                        }`}>
                          {lesson.event_type}
                        </span>
                      )}
                      {lesson.start_time && (
                        <p className="text-sm text-gray-600">Horário: {lesson.start_time}</p>
                      )}
                      {lesson.leader && (
                        <p className="text-sm text-gray-600">Preletor: {lesson.leader}</p>
                      )}
                    </>
                  ) : (
                    lesson.teacher && (
                      <p className="text-sm text-gray-600">Ministrante: {lesson.teacher}</p>
                    )
                  )}
                </div>
                {lesson.notes && (
                  <p className="text-sm text-gray-500 mt-2">{lesson.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(lesson)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {lessons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {context === 'recepcao' ? 'Nenhum evento cadastrado' : 'Nenhuma aula cadastrada'}
          </div>
        )}
      </div>

      {showForm && (
        <LessonForm
          lesson={editingLesson}
          onClose={handleFormClose}
          context={context}
        />
      )}
    </div>
  );
}
