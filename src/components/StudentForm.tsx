import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Student, Group, StudentInsert, Sex, GroupName } from '../lib/database.types';
import { useNotificationContext } from '../App';

interface StudentFormProps {
  student: Student | null;
  groups: Group[];
  onClose: () => void;
}

export function StudentForm({ student, groups, onClose }: StudentFormProps) {
  const { showSuccess, showError } = useNotificationContext();
  const [formData, setFormData] = useState<StudentInsert>({
    full_name: '',
    birth_date: null,
    sex: null,
    group_id: null,
    guardian_name: null,
    guardian_contact: null,
    notes: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name,
        birth_date: student.birth_date,
        sex: student.sex,
        group_id: student.group_id,
        guardian_name: student.guardian_name,
        guardian_contact: student.guardian_contact,
        notes: student.notes,
      });
    }
  }, [student]);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (student) {
        const { error } = await (supabase as any)
          .from('students')
          .update({
            full_name: formData.full_name,
            birth_date: formData.birth_date,
            sex: formData.sex,
            group_id: formData.group_id,
            guardian_name: formData.guardian_name,
            guardian_contact: formData.guardian_contact,
            notes: formData.notes
          })
          .eq('id', student.id);

        if (error) throw error;
        showSuccess('Aluno atualizado com sucesso!');
      } else {
        const { error } = await (supabase as any)
          .from('students')
          .insert([{
            full_name: formData.full_name,
            birth_date: formData.birth_date,
            sex: formData.sex,
            group_id: formData.group_id,
            guardian_name: formData.guardian_name,
            guardian_contact: formData.guardian_contact,
            notes: formData.notes
          }]);

        if (error) throw error;
        showSuccess('Aluno criado com sucesso!');
      }
    } catch (error: any) {
      showError(
        student ? 'Erro ao atualizar aluno' : 'Erro ao criar aluno',
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
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {student ? 'Editar Aluno' : 'Novo Aluno'}
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
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo
              </label>
              <select
                value={formData.sex || ''}
                onChange={(e) => setFormData({ ...formData, sex: (e.target.value as Sex) || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupo
            </label>
            <select
              value={formData.group_id || ''}
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Responsável
              </label>
              <input
                type="text"
                value={formData.guardian_name || ''}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contato do Responsável
              </label>
              <input
                type="text"
                value={formData.guardian_contact || ''}
                onChange={(e) => setFormData({ ...formData, guardian_contact: e.target.value || null })}
                placeholder="(11) 99999-9999"
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
