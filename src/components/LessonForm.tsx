import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Lesson } from "../lib/database.types";
import { useNotificationContext } from "../App";
import { useGroups } from "../hooks/useGroupQueries";

interface LessonFormProps {
  lesson: Lesson | null;
  onClose: () => void;
  context: "ministerio" | "recepcao";
}

export function LessonForm({ lesson, onClose, context }: LessonFormProps) {
  const { showSuccess, showError } = useNotificationContext();
  const { data: groups = [] } = useGroups(context);

  const [formData, setFormData] = useState<any>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    teacher: null,
    leader: null,
    event_type: "Culto",
    start_time: null,
    notes: null,
    group_id: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        date: lesson.date,
        teacher: lesson.teacher,
        leader: (lesson as any).leader,
        event_type: (lesson as any).event_type || "Culto",
        start_time: (lesson as any).start_time,
        notes: lesson.notes,
        group_id: (lesson as any).group_id || null,
      });
    }
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (lesson) {
        const tableName =
          context === "recepcao" ? "reception_events" : "lessons";

        let updateData: any = {
          title: formData.title,
          date: formData.date,
          notes: formData.notes,
          group_id: formData.group_id,
        };

        if (context === "recepcao") {
          updateData.leader = formData.leader;
          updateData.event_type = formData.event_type;
          updateData.start_time = formData.start_time;
        } else {
          updateData.teacher = formData.teacher;
        }

        const { error } = await (supabase as any)
          .from(tableName)
          .update(updateData)
          .eq("id", lesson.id);

        if (error) throw error;
        const entityName = context === "recepcao" ? "Evento" : "Aula";
        showSuccess(`${entityName} atualizada com sucesso!`);
      } else {
        const tableName =
          context === "recepcao" ? "reception_events" : "lessons";

        let insertData: any = {
          title: formData.title,
          date: formData.date,
          notes: formData.notes,
          group_id: formData.group_id,
        };

        if (context === "recepcao") {
          insertData.leader = formData.leader;
          insertData.event_type = formData.event_type;
          insertData.start_time = formData.start_time;
        } else {
          insertData.teacher = formData.teacher;
        }

        const { error } = await (supabase as any)
          .from(tableName)
          .insert([insertData]);

        if (error) throw error;
        const entityName = context === "recepcao" ? "Evento" : "Aula";
        showSuccess(`${entityName} criado com sucesso!`);
      }
    } catch (error: any) {
      const entityName = context === "recepcao" ? "evento" : "aula";
      showError(
        lesson
          ? `Erro ao atualizar ${entityName}`
          : `Erro ao criar ${entityName}`,
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
            {lesson
              ? context === "recepcao"
                ? "Editar Evento"
                : "Editar Aula"
              : context === "recepcao"
              ? "Novo Evento"
              : "Nova Aula"}
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
              {context === "recepcao"
                ? "Nome do Evento *"
                : "Tema / Nome da Aula *"}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Fruto do Espírito"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupo / Turma *
            </label>
            <select
              required
              value={formData.group_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, group_id: e.target.value || null })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o grupo...</option>
              {groups.map((group: any) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Apenas alunos deste grupo aparecerão na chamada
            </p>
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
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {context === "recepcao" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={formData.start_time || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      start_time: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Campos específicos para cada contexto */}
          {context === "recepcao" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento *
                </label>
                <select
                  value={formData.event_type || "Culto"}
                  onChange={(e) =>
                    setFormData({ ...formData, event_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Culto">Culto</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Evento Especial">Evento Especial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável
                </label>
                <input
                  type="text"
                  value={formData.leader || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, leader: e.target.value || null })
                  }
                  placeholder="Ex: Pastor João"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ministrante
              </label>
              <input
                type="text"
                value={formData.teacher || ""}
                onChange={(e) =>
                  setFormData({ ...formData, teacher: e.target.value || null })
                }
                placeholder="Ex: Pr. Daniel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value || null })
              }
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
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
