import { AlertTriangle, RefreshCw, FileText } from "lucide-react";

export function EnvironmentErrorScreen() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
        <div className="flex flex-col items-center text-center">
          {/* Ícone de alerta */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Configuração Incompleta
          </h1>

          {/* Mensagem principal */}
          <p className="text-lg text-gray-600 mb-6">
            As variáveis de ambiente do Supabase não foram configuradas
            corretamente.
          </p>

          {/* Card de informações */}
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              Como resolver:
            </h2>

            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Crie um arquivo{" "}
                  <code className="bg-red-100 px-2 py-1 rounded text-sm font-mono">
                    .env
                  </code>{" "}
                  na raiz do projeto
                </span>
              </li>

              <li className="flex items-start">
                <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                  2
                </span>
                <div className="flex-1">
                  <span className="block mb-2">
                    Adicione as seguintes variáveis:
                  </span>
                  <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
                    {`VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima`}
                  </pre>
                </div>
              </li>

              <li className="flex items-start">
                <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Obtenha as credenciais no painel do Supabase em{" "}
                  <span className="font-semibold">Settings → API</span>
                </span>
              </li>

              <li className="flex items-start">
                <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  Reinicie o servidor de desenvolvimento após configurar
                </span>
              </li>
            </ol>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={handleRefresh}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Recarregar Página
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Abrir Supabase
            </a>
          </div>

          {/* Informação adicional */}
          <p className="text-sm text-gray-500 mt-6">
            Precisa de ajuda? Consulte a{" "}
            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 underline"
            >
              documentação do Supabase
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
