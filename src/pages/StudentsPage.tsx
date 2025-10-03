import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import type { Student, StudentWithStatus, Group, GroupName } from '../lib/database.types';
import { StudentForm } from '../components/StudentForm';
import { useNotificationContext, useConfirmContext } from '../App';

export function StudentsPage() {
  const { showSuccess, showError } = useNotificationContext();
  const { showConfirm } = useConfirmContext();
  const [students, setStudents] = useState<StudentWithStatus[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<GroupName | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Ativo' | 'Faltoso' | 'Inativo'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [studentsRes, groupsRes] = await Promise.all([
      supabase.from('v_student_status').select('*').order('full_name'),
      supabase.from('groups').select('*')
    ]);

    if (studentsRes.data) setStudents(studentsRes.data);
    if (groupsRes.data) setGroups(groupsRes.data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Excluir Aluno',
      message: 'Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (!confirmed) return;

    const { error } = await (supabase as any).from('students').delete().eq('id', id);
    if (error) {
      showError('Erro ao excluir aluno', error.message);
    } else {
      showSuccess('Aluno excluído com sucesso!');
      loadData();
    }
  };

  const handleEdit = async (studentId: string) => {
    const { data } = await supabase.from('students').select('*').eq('id', studentId).single();
    if (data) {
      setEditingStudent(data);
      setShowForm(true);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStudent(null);
    loadData();
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'all' || s.group_name === filterGroup;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'text-emerald-600 bg-emerald-50';
      case 'Faltoso': return 'text-amber-600 bg-amber-50';
      case 'Inativo': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Carregando...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Novo Aluno
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value as GroupName | 'all')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Grupos</option>
            {groups.map(g => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Faltoso">Faltoso</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <div key={student.student_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{student.full_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                  <span>Grupo: {student.group_name || '—'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(student.student_id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(student.student_id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum aluno encontrado
          </div>
        )}
      </div>

      {showForm && (
        <StudentForm
          student={editingStudent}
          groups={groups}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
