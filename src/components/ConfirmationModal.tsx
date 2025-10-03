
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  alunosNaoMarcados: string[];
  totalNaoMarcados: number;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  alunosNaoMarcados,
  totalNaoMarcados
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 font-medium">
              {message.replace(/⚠️/g, '')}
            </p>
          </div>

          {alunosNaoMarcados.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Alunos que serão marcados como AUSENTES:
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                <ul className="space-y-2">
                  {alunosNaoMarcados.map((aluno, index) => (
                    <li key={index} className="flex items-center gap-2 text-red-700">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                      <span className="text-sm">{aluno}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{totalNaoMarcados}</span> aluno(s) 
              não foram marcados e ficarão como ausentes automaticamente.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Salvar Chamada
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de sucesso
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumo: {
    total_alunos: number;
    total_presentes: number;
    total_ausentes: number;
    total_nao_marcados: number;
  };
}

export function SuccessModal({ isOpen, onClose, resumo }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-emerald-600 text-2xl">✅</div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Chamada Salva!</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de alunos:</span>
              <span className="font-semibold">{resumo.total_alunos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-600">Presentes:</span>
              <span className="font-semibold text-emerald-600">{resumo.total_presentes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-600">Ausentes:</span>
              <span className="font-semibold text-red-600">{resumo.total_ausentes}</span>
            </div>
            {resumo.total_nao_marcados > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-amber-600 text-sm">Auto-ausentes:</span>
                <span className="font-semibold text-amber-600">{resumo.total_nao_marcados}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}