import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, Eye, X } from "lucide-react";
import type { MemberType } from "../lib/database.types";
import { StudentForm } from "../components/StudentForm";
import { Avatar } from "../components/Avatar";
import { useNotificationContext, useConfirmContext } from "../App";
import {
  useStudentsWithStatus,
  useDeleteStudent,
} from "../hooks/useStudentQueries";
import { useGroups } from "../hooks/useGroupQueries";
import { supabase } from "../lib/supabase";

interface StudentsPageProps {
  context?: "ministerio" | "recepcao";
}

export function StudentsPage({ context = "ministerio" }: StudentsPageProps) {
  const { showSuccess, showError } = useNotificationContext();
  const { showConfirm } = useConfirmContext();

  // React Query hooks
  const {
    data: students = [],
    isLoading: loading,
    refetch,
  } = useStudentsWithStatus(context);
  const { data: groups = [] } = useGroups(context);
  const deleteStudent = useDeleteStudent(context);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState<string | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string | "all">("all");
  const [filterMemberType, setFilterMemberType] = useState<MemberType | "all">(
    "all"
  );
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);

  const handleDelete = async (id: string) => {
    const entityName = context === "recepcao" ? "membro" : "aluno";
    const confirmed = await showConfirm({
      title: `Excluir ${entityName}`,
      message: `Tem certeza que deseja excluir este ${entityName}? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      await deleteStudent.mutateAsync(id);
      showSuccess(`${entityName} excluído com sucesso!`);
    } catch (error: any) {
      showError(`Erro ao excluir ${entityName}`, error.message);
    }
  };

  const handleEdit = async (studentId: string) => {
    const tableName = context === "recepcao" ? "reception_members" : "students";
    const { data } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", studentId)
      .single();
    if (data) {
      setEditingStudent(data);
      setShowForm(true);
    }
  };

  const handleView = async (studentId: string) => {
    const tableName = context === "recepcao" ? "reception_members" : "students";
    const { data } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", studentId)
      .single();
    if (data) {
      setViewingStudent(data);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStudent(null);
    refetch(); // Refetch usando React Query
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = s.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesGroup =
        filterGroup === "all" || s.group_name === filterGroup;
      const matchesStatus = filterStatus === "all" || s.status === filterStatus;
      const matchesMemberType =
        context === "ministerio" ||
        filterMemberType === "all" ||
        s.member_type === filterMemberType;
      return (
        matchesSearch && matchesGroup && matchesStatus && matchesMemberType
      );
    });
  }, [
    students,
    searchTerm,
    filterGroup,
    filterStatus,
    filterMemberType,
    context,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "text-emerald-600 bg-emerald-50";
      case "Faltoso":
        return "text-amber-600 bg-amber-50";
      case "Moderado":
        return "text-amber-600 bg-amber-50";
      case "Inativo":
        return "text-red-600 bg-red-50";
      case "Sem Registro":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-0 pb-6">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {context === "recepcao" ? "Membros" : "Alunos"}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base ${
            context === "recepcao"
              ? "bg-teal-600 hover:bg-teal-700"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-xl transition-colors shadow-sm`}
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">
            {context === "recepcao" ? "Novo Membro" : "Novo Aluno"}
          </span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={
                context === "recepcao" ? "Buscar membro..." : "Buscar aluno..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">
              {context === "recepcao"
                ? "Todas as Células/Ministérios"
                : "Todos os Grupos"}
            </option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          {context === "recepcao" && (
            <select
              value={filterMemberType}
              onChange={(e) =>
                setFilterMemberType(e.target.value as MemberType | "all")
              }
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">Todos os Tipos</option>
              <option value="Membro">Membros</option>
              <option value="Visitante">Visitantes</option>
            </select>
          )}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Todos os Status</option>
            {context === "recepcao" ? (
              <>
                <option value="Ativo">Ativo</option>
                <option value="Moderado">Moderado</option>
                <option value="Inativo">Inativo</option>
                <option value="Sem Registro">Sem Registro</option>
              </>
            ) : (
              <>
                <option value="Ativo">Ativo</option>
                <option value="Faltoso">Faltoso</option>
                <option value="Inativo">Inativo</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredStudents.map((student) => (
          <div
            key={student.student_id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <Avatar
                src={student.photo_url}
                name={student.full_name}
                size="md"
                onClick={() => handleView(student.student_id)}
                className="cursor-pointer border-2 border-gray-300 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {student.full_name}
                  </h3>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                      student.status
                    )}`}
                  >
                    {student.status}
                  </span>
                  {context === "recepcao" && student.member_type && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        student.member_type === "Membro"
                          ? "text-blue-600 bg-blue-50"
                          : "text-purple-600 bg-purple-50"
                      }`}
                    >
                      {student.member_type}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1 text-xs sm:text-sm text-gray-600">
                  <span>
                    {context === "recepcao" ? "Célula/Min." : "Grupo"}:{" "}
                    {student.group_name || "—"}
                  </span>
                  {context === "recepcao" && student.contact_phone && (
                    <span>Tel: {student.contact_phone}</span>
                  )}
                  {context === "recepcao" &&
                    student.attendance_percentage !== undefined && (
                      <span>Freq.: {student.attendance_percentage}%</span>
                    )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => handleView(student.student_id)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Ver detalhes"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleEdit(student.student_id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(student.student_id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {context === "recepcao"
              ? "Nenhum membro encontrado"
              : "Nenhum aluno encontrado"}
          </div>
        )}
      </div>

      {showForm && (
        <StudentForm
          student={editingStudent}
          groups={groups}
          onClose={handleFormClose}
          context={context}
        />
      )}

      {/* Student Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {context === "recepcao"
                  ? "Detalhes do Membro"
                  : "Detalhes do Aluno"}
              </h2>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Photo and Basic Info */}
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar
                  src={viewingStudent.photo_url}
                  name={viewingStudent.full_name}
                  size="xl"
                  className="w-24 h-24 text-xl border-2 border-gray-300"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {viewingStudent.full_name}
                  </h3>
                  <p className="text-gray-600">
                    {viewingStudent.birth_date
                      ? `${
                          new Date().getFullYear() -
                          new Date(viewingStudent.birth_date).getFullYear()
                        } anos`
                      : "Idade não informada"}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Sexo
                    </label>
                    <p className="text-gray-900">
                      {viewingStudent.sex === "M"
                        ? "Masculino"
                        : viewingStudent.sex === "F"
                        ? "Feminino"
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Data de Nascimento
                    </label>
                    <p className="text-gray-900">
                      {viewingStudent.birth_date
                        ? new Date(
                            viewingStudent.birth_date
                          ).toLocaleDateString("pt-BR")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {context === "recepcao" ? "Célula/Ministério" : "Grupo"}
                  </label>
                  <p className="text-gray-900">
                    {groups.find((g) => g.id === viewingStudent.group_id)
                      ?.name || "—"}
                  </p>
                </div>

                {context === "recepcao" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tipo
                      </label>
                      <p className="text-gray-900">
                        {viewingStudent.member_type || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Telefone
                        </label>
                        <p className="text-gray-900">
                          {viewingStudent.contact_phone || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">
                          {viewingStudent.contact_email || "—"}
                        </p>
                      </div>
                    </div>
                    {viewingStudent.address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Endereço
                        </label>
                        <p className="text-gray-900">
                          {viewingStudent.address}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Responsável
                      </label>
                      <p className="text-gray-900">
                        {viewingStudent.guardian_name || "—"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Contato
                      </label>
                      <p className="text-gray-900">
                        {viewingStudent.guardian_contact || "—"}
                      </p>
                    </div>
                  </div>
                )}

                {viewingStudent.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Observações
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {viewingStudent.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setViewingStudent(null);
                    handleEdit(viewingStudent.id);
                  }}
                  className={`flex-1 px-4 py-2 ${
                    context === "recepcao"
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-xl transition-colors`}
                >
                  {context === "recepcao" ? "Editar Membro" : "Editar Aluno"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
