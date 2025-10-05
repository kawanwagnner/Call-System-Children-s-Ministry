import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Lesson, LessonInsert } from '../lib/database.types';
import { useNotificationContext } from '../App';

interface LessonFormProps {
  lesson: Lesson | null;
  onClose: () => void;
}

export function LessonForm({ lesson, onClose }: LessonFormProps) {
  const { showSuccess, showError } = useNotificationContext();
  const [formData, setFormData] = useState<LessonInsert>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    teacher: null,
    notes: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        date: lesson.date,
        teacher: lesson.teacher,
        notes: lesson.notes,
      });
    }
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (lesson) {
        const { error } = await (supabase as any)
          .from('lessons')
          .update({
            title: formData.title,
            date: formData.date,
            teacher: formData.teacher,
            notes: formData.notes
          })
          .eq('id', lesson.id);

        if (error) throw error;
        showSuccess('Aula atualizada com sucesso!');
      } else {
        const { error } = await (supabase as any)
          .from('lessons')
          .insert([{
            title: formData.title,
            date: formData.date,
            teacher: formData.teacher,
            notes: formData.notes
          }]);

        if (error) throw error;
        showSuccess('Aula criada com sucesso!');
      }
    } catch (error: any) {
      showError(
        lesson ? 'Erro ao atualizar aula' : 'Erro ao criar aula',
        error.message
      );
      setSaving(false);
      return;
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {lesson ? 'Editar Aula' : 'Nova Aula'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema / Nome da Aula *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Fruto do Espírito"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ministrante
              </label>
              <input
                type="text"
                value={formData.teacher || ''}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value || null })}
                placeholder="Ex: Pr. Daniel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
              rows={3}
              placeholder="Anotações sobre a aula, versículo principal, atividades..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
