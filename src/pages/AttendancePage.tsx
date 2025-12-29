import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Search } from 'lucide-react';
import { ConfirmationModal, SuccessModal } from '../components/ConfirmationModal';
import { useNotificationContext } from '../App';
import type { GroupName } from '../lib/database.types';

interface AttendancePageProps {
  context?: 'ministerio' | 'recepcao';
}

export function AttendancePage({ context = 'ministerio' }: AttendancePageProps) {
  const { showError, showWarning } = useNotificationContext();
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string | 'all'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    totalNaoMarcados: number;
    alunosNaoMarcados: string[];
    presencasMarcadas: Record<string, boolean>;
  } | null>(null);
  const [successData, setSuccessData] = useState<{
    total_alunos: number;
    total_presentes: number;
    total_ausentes: number;
    total_nao_marcados: number;
  } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [context]);

  useEffect(() => {
    if (selectedLessonId) {
      loadAttendance();
    }
  }, [selectedLessonId, context]);

  const loadInitialData = async () => {
    setLoading(true);
    
    if (context === 'recepcao') {
      const [eventsRes, membersRes, groupsRes] = await Promise.all([
        supabase.from('reception_events').select('*').order('date', { ascending: false }),
        supabase.from('v_reception_member_status').select('*').order('full_name'),
        supabase.from('reception_groups').select('*')
      ]);

      if (eventsRes.data) setLessons(eventsRes.data);
      if (membersRes.data) setStudents(membersRes.data);
      if (groupsRes.data) setGroups(groupsRes.data);
    } else {
      const [lessonsRes, studentsRes, groupsRes] = await Promise.all([
        supabase.from('lessons').select('*').order('date', { ascending: false }),
        supabase.from('v_student_status').select('*').order('full_name'),
        supabase.from('groups').select('*')
      ]);

      if (lessonsRes.data) setLessons(lessonsRes.data);
      if (studentsRes.data) setStudents(studentsRes.data);
      if (groupsRes.data) setGroups(groupsRes.data);
    }
    
    setLoading(false);
  };

  const loadAttendance = async () => {
    if (!selectedLessonId) return;

    const tableName = context === 'recepcao' ? 'reception_attendance' : 'attendance';
    const memberIdField = context === 'recepcao' ? 'member_id' : 'student_id';
    const eventIdField = context === 'recepcao' ? 'event_id' : 'lesson_id';

    const { data } = await supabase
      .from(tableName)
      .select(`${memberIdField}, present`)
      .eq(eventIdField, selectedLessonId);

    const attendanceMap: Record<string, boolean> = {};
    data?.forEach((record: any) => {
      const memberId = record[memberIdField];
      attendanceMap[memberId] = record.present;
    });
    setAttendance(attendanceMap);
  };

  const toggleAttendance = (studentId: string, present: boolean) => {
    setAttendance((prev) => ({ ...prev, [studentId]: present }));
  };

  const executarSalvamento = async (presencasMarcadas: Record<string, boolean>) => {
    try {
      // Usar função RPC para salvar em ambos os contextos
      const rpcFunction = context === 'recepcao' 
        ? 'salvar_checkin_completo_recepcao' 
        : 'salvar_chamada_completa';
      
      const eventParam = context === 'recepcao' 
        ? { p_event_id: selectedLessonId, p_presencas_marcadas: presencasMarcadas }
        : { p_lesson_id: selectedLessonId, p_presencas_marcadas: presencasMarcadas };

      const saveResponse = await (supabase as any).rpc(rpcFunction, eventParam);
      
      const { data: resultado, error: saveError } = saveResponse;

      if (saveError) {
        console.error('Erro ao salvar:', saveError);
        showError('Erro ao salvar chamada', saveError.message);
      } else if (!resultado) {
        showError('Erro ao salvar chamada', 'Não foi possível salvar a chamada');
      } else {
        console.log('Chamada salva:', resultado);
        setSuccessData(resultado.resumo);
        setShowSuccessModal(true);
        await loadAttendance();
      }
    } catch (error) {
      console.error('Erro inesperado ao salvar:', error);
      showError('Erro inesperado', 'Erro inesperado ao salvar chamada');
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    if (confirmationData) {
      setSaving(true);
      await executarSalvamento(confirmationData.presencasMarcadas);
      setSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
    setConfirmationData(null);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
  };

  const handleSave = async () => {
    const entityName = context === 'recepcao' ? 'evento' : 'aula';
    if (!selectedLessonId) {
      showWarning('Atenção', `Selecione um ${entityName} primeiro`);
      return;
    }

    setSaving(true);

    try {
      // Preparar dados: apenas alunos/membros que foram marcados (presente ou ausente)
      const presencasMarcadas: Record<string, boolean> = {};
      
      // Incluir apenas alunos/membros que foram explicitamente marcados
      Object.entries(attendance).forEach(([studentId, present]) => {
        if (present !== undefined) {
          presencasMarcadas[studentId] = present;
        }
      });

      console.log('Presenças marcadas:', presencasMarcadas);

      // Usar função RPC para verificação em ambos os contextos
      const rpcFunction = context === 'recepcao' 
        ? 'verificar_membros_nao_marcados_recepcao' 
        : 'verificar_alunos_nao_marcados';
      
      const eventParam = context === 'recepcao' 
        ? { p_event_id: selectedLessonId, p_presencas_marcadas: presencasMarcadas }
        : { p_lesson_id: selectedLessonId, p_presencas_marcadas: presencasMarcadas };

      const verificacaoResponse = await (supabase as any).rpc(rpcFunction, eventParam);
      
      const { data: verificacao, error: verificacaoError } = verificacaoResponse;

      if (verificacaoError) {
        console.error('Erro na verificação:', verificacaoError);
        showError('Erro ao verificar chamada', verificacaoError.message);
        setSaving(false);
        return;
      }

      if (!verificacao) {
        showError('Erro ao verificar chamada', 'Não foi possível verificar a chamada');
        setSaving(false);
        return;
      }

      console.log('Resultado da verificação:', verificacao);

      // Se há membros/alunos não marcados, mostrar modal de confirmação
      if (verificacao.precisa_confirmacao && verificacao.total_nao_marcados > 0) {
        setConfirmationData({
          totalNaoMarcados: verificacao.total_nao_marcados,
          alunosNaoMarcados: context === 'recepcao' ? verificacao.membros_nao_marcados : verificacao.alunos_nao_marcados,
          presencasMarcadas
        });
        setShowConfirmModal(true);
        setSaving(false);
        return;
      }

      // Se não há membros/alunos não marcados, salvar diretamente
      await executarSalvamento(presencasMarcadas);

    } catch (error) {
      console.error('Erro inesperado:', error);
      showError('Erro inesperado', 'Erro inesperado ao processar a chamada');
    }

    setSaving(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'text-emerald-600 bg-emerald-50';
      case 'Faltoso': return 'text-amber-600 bg-amber-50';
      case 'Moderado': return 'text-amber-600 bg-amber-50';
      case 'Inativo': return 'text-red-600 bg-red-50';
      case 'Sem Registro': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'all' || s.group_name === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const presentCount = Object.values(attendance).filter((p) => p === true).length;
  const absentCount = Object.values(attendance).filter((p) => p === false).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Carregando...</div></div>;
  }

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {context === 'recepcao' ? 'Check-in' : 'Chamada'}
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {context === 'recepcao' ? 'Selecionar Evento' : 'Selecionar Aula'}
        </label>
        <select
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{context === 'recepcao' ? 'Selecione um evento' : 'Selecione uma aula'}</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {formatDate(lesson.date)} - {lesson.title}
            </option>
          ))}
        </select>

        {selectedLesson && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">{selectedLesson.title}</h3>
            <p className="text-sm text-gray-600">Data: {formatDate(selectedLesson.date)}</p>
            {context === 'recepcao' ? (
              <>
                {selectedLesson.event_type && (
                  <p className="text-sm text-gray-600">Tipo: {selectedLesson.event_type}</p>
                )}
                {selectedLesson.start_time && (
                  <p className="text-sm text-gray-600">Horário: {selectedLesson.start_time}</p>
                )}
                {selectedLesson.leader && (
                  <p className="text-sm text-gray-600">Preletor: {selectedLesson.leader}</p>
                )}
              </>
            ) : (
              selectedLesson.teacher && (
                <p className="text-sm text-gray-600">Ministrante: {selectedLesson.teacher}</p>
              )
            )}
          </div>
        )}
      </div>

      {selectedLessonId && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={context === 'recepcao' ? 'Buscar membro...' : 'Buscar aluno...'}
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
                <option value="all">{context === 'recepcao' ? 'Todas as Células/Ministérios' : 'Todos os Grupos'}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Presentes:</span>
                <span className="font-semibold text-emerald-600">{presentCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Ausentes:</span>
                <span className="font-semibold text-red-600">{absentCount}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const memberId = context === 'recepcao' ? student.member_id : student.student_id;
              return (
                <div
                  key={memberId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">{context === 'recepcao' ? 'Célula/Min.' : 'Grupo'}: {student.group_name || '—'}</p>
                      {context === 'recepcao' && student.member_type && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          student.member_type === 'Membro' ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'
                        }`}>
                          {student.member_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAttendance(memberId, true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        attendance[memberId] === true
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-600'
                      }`}
                    >
                      <Check size={18} />
                      Presente
                    </button>
                    <button
                      onClick={() => toggleAttendance(memberId, false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        attendance[memberId] === false
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-red-600'
                      }`}
                    >
                      <X size={18} />
                      Ausente
                    </button>
                  </div>
                </div>
                </div>
              );
            })}

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {context === 'recepcao' ? 'Nenhum membro encontrado' : 'Nenhum aluno encontrado'}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-2xl shadow-lg">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full px-6 py-3 ${context === 'recepcao' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl transition-colors disabled:opacity-50 font-semibold`}
            >
              {saving ? 'Salvando...' : (context === 'recepcao' ? 'Salvar Check-in' : 'Salvar Chamada')}
            </button>
          </div>
        </>
      )}

      {/* Modal de Confirmação */}
      {confirmationData && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={handleCancelSave}
          onConfirm={handleConfirmSave}
          title={context === 'recepcao' ? 'Confirmar Check-in' : 'Confirmar Chamada'}
          message={`${confirmationData.totalNaoMarcados} ${context === 'recepcao' ? 'membro(s)' : 'aluno(s)'} não foram marcados!`}
          alunosNaoMarcados={confirmationData.alunosNaoMarcados}
          totalNaoMarcados={confirmationData.totalNaoMarcados}
        />
      )}

      {/* Modal de Sucesso */}
      {successData && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccess}
          resumo={successData}
        />
      )}
    </div>
  );
}
