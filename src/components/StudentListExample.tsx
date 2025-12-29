import {
  useStudents,
  useCreateStudent,
  useDeleteStudent,
} from "../hooks/useStudentQueries";
import { useNotificationContext } from "../App";

export function StudentListExample() {
  const { data: students, isLoading, error, refetch } = useStudents();
  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();
  const { showSuccess, showError } = useNotificationContext();

  const handleAddStudent = async () => {
    try {
      await createStudent.mutateAsync({
        full_name: "Novo Aluno",
        birth_date: "2020-01-01",
        sex: null,
        group_id: null,
        guardian_name: "Responsável",
        guardian_contact: "11999999999",
        notes: null,
        photo_url: null,
      });
      showSuccess("Aluno criado com sucesso!");
    } catch (error) {
      showError(
        "Erro ao criar aluno",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudent.mutateAsync(id);
      showSuccess("Aluno deletado com sucesso!");
    } catch (error) {
      showError(
        "Erro ao deletar aluno",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  };

  if (isLoading) {
    return <div>Carregando alunos...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        Erro ao carregar alunos: {error.message}
        <button
          onClick={() => refetch()}
          className="ml-2 text-blue-600 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Alunos ({students?.length || 0})</h2>
        <button
          onClick={handleAddStudent}
          disabled={createStudent.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {createStudent.isPending ? "Criando..." : "Adicionar Aluno"}
        </button>
      </div>

      <div className="space-y-2">
        {students?.map((student) => (
          <div
            key={student.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{student.full_name}</h3>
              <p className="text-sm text-gray-600">
                Responsável: {student.guardian_name || "Não informado"}
              </p>
            </div>
            <button
              onClick={() => handleDeleteStudent(student.id)}
              disabled={deleteStudent.isPending}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {deleteStudent.isPending ? "Deletando..." : "Deletar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
