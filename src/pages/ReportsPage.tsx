import { useState, useEffect } from "react";
import { TrendingUp, Users, BookOpen, Calendar } from "lucide-react";
import { useNotificationContext } from "../App";
import { useReportsData } from "../hooks/useReportQueries";

interface AbsentStudent {
  full_name: string;
  guardian_name?: string | null;
  guardian_contact?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  group_name: string | null;
  member_type?: string;
}

interface StudentAttendanceStats {
  full_name: string;
  presenca_percent: number | null;
  presencas: number;
  faltas: number;
  member_type?: string;
}

interface GroupAttendanceStats {
  grupo: string | null;
  presenca_percent: number | null;
  presencas: number;
  faltas: number;
}

interface LessonAttendanceStats {
  date: string;
  title: string;
  presentes: number;
  ausentes: number;
  total: number;
}

interface ReportsPageProps {
  context?: "ministerio" | "recepcao";
}

export function ReportsPage({ context = "ministerio" }: ReportsPageProps) {
  const { showError } = useNotificationContext();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // React Query hook para carregar dados de relatórios
  const {
    data,
    isLoading: loading,
    error,
  } = useReportsData(context, selectedDate);

  const absentToday = data?.absentToday || [];
  const studentStats = data?.studentStats || [];
  const groupStats = data?.groupStats || [];
  const lessonStats = data?.lessonStats || [];

  // Mostrar erro se houver (usando useEffect para evitar erro de setState durante render)
  useEffect(() => {
    if (error) {
      showError(
        "Erro ao carregar relatórios",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }, [error, showError]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const generateWhatsAppLink = (phone: string, studentName: string) => {
    // Limpar o número (remover caracteres não numéricos)
    const cleanPhone = phone.replace(/[^0-9]/g, "");

    // Adicionar código do país se não tiver (assumindo Brasil +55)
    const formattedPhone = cleanPhone.startsWith("55")
      ? cleanPhone
      : `55${cleanPhone}`;

    // Mensagem carinhosa personalizada
    const message = `Oi! Como você está? 😊\n\nSenti falta do(a) ${studentName} na aula de hoje do Ministério Infantil! 😢 Ele(a) sempre traz tanta alegria para nossa turma!\n\nEspero que estejam todos bem por aí. Quando puderem, venham nos visitar! Tenho certeza que as crianças vão ficar felizes em vê-los! 🙏✨\n\nUm grande abraço e que Deus os abençoe sempre! ❤️`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      message
    )}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {context === "recepcao" ? "Relatórios de Recepção" : "Relatórios"}
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {context === "recepcao"
            ? "Data de Referência"
            : "Data de Referência (para Ausentes)"}
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <Calendar className="text-red-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {context === "recepcao"
              ? "Membros com Baixa Frequência"
              : `Ausentes do Dia (${formatDate(selectedDate)})`}
          </h2>
        </div>

        {absentToday.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {context === "recepcao"
              ? "Todos os membros têm boa frequência!"
              : "Nenhum ausente registrado nesta data"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Grupo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {context === "recepcao" ? "Tipo" : "Responsável"}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Contato
                  </th>
                </tr>
              </thead>
              <tbody>
                {absentToday.map((student, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{student.full_name}</td>
                    <td className="py-3 px-4">{student.group_name || "—"}</td>
                    <td className="py-3 px-4">
                      {context === "recepcao"
                        ? student.member_type || "—"
                        : student.guardian_name || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {context === "recepcao" ? (
                        student.contact_phone ? (
                          <a
                            href={generateWhatsAppLink(
                              student.contact_phone,
                              student.full_name
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-700 hover:text-green-800 underline transition-colors"
                            title="Enviar mensagem no WhatsApp"
                          >
                            {student.contact_phone}
                          </a>
                        ) : (
                          "—"
                        )
                      ) : student.guardian_contact ? (
                        <a
                          href={generateWhatsAppLink(
                            student.guardian_contact,
                            student.full_name
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:text-green-800 underline transition-colors"
                          title="Enviar mensagem no WhatsApp"
                        >
                          {student.guardian_contact}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="text-blue-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {context === "recepcao"
              ? "Presença por Membro"
              : "Presença por Aluno"}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Nome
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Presença %
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Presenças
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Faltas
                </th>
              </tr>
            </thead>
            <tbody>
              {studentStats.map((stat, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{stat.full_name}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-semibold ${
                        (stat.presenca_percent ?? 0) >= 80
                          ? "text-emerald-600"
                          : (stat.presenca_percent ?? 0) >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.presenca_percent?.toFixed(1) ?? "—"}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{stat.presencas}</td>
                  <td className="py-3 px-4 text-right">{stat.faltas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Presença por Grupo
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {groupStats.map((stat, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">
                {stat.grupo || "Sem Grupo"}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Presença:</span>
                  <span
                    className={`font-semibold ${
                      (stat.presenca_percent ?? 0) >= 80
                        ? "text-emerald-600"
                        : (stat.presenca_percent ?? 0) >= 60
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.presenca_percent?.toFixed(1) ?? "—"}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Presenças:</span>
                  <span className="font-semibold">{stat.presencas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faltas:</span>
                  <span className="font-semibold">{stat.faltas}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <BookOpen className="text-purple-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Presença por Aula (Últimas 10)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Data
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Título
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Presentes
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Ausentes
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lessonStats.map((stat, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{formatDate(stat.date)}</td>
                  <td className="py-3 px-4">{stat.title}</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                    {stat.presentes}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 font-semibold">
                    {stat.ausentes}
                  </td>
                  <td className="py-3 px-4 text-right">{stat.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
