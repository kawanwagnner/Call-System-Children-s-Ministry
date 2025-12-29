import { useState, createContext, useContext, useEffect } from "react";
import {
  Users,
  BookOpen,
  CheckSquare,
  BarChart3,
  Menu,
  X,
  Home,
  RotateCcw,
} from "lucide-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HomePage } from "./pages/HomePage";
import { StudentsPage } from "./pages/StudentsPage";
import { LessonsPage } from "./pages/LessonsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { ReportsPage } from "./pages/ReportsPage";
import { NotificationContainer } from "./components/NotificationContainer";
import { LoadingScreen } from "./components/LoadingScreen";
import { EnvironmentErrorScreen } from "./components/EnvironmentErrorScreen";
import { useNotifications } from "./hooks/useNotifications";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useConfirmDialog } from "./hooks/useConfirmDialog";
import { hasEnvironmentVariables } from "./lib/supabase";
import { queryClient } from "./lib/queryClient";

type Page = "home" | "students" | "lessons" | "attendance" | "reports";

// Contexto para notificações
interface NotificationContextType {
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

// Contexto para confirmações
interface ConfirmContextType {
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
  }) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirmContext = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirmContext must be used within a ConfirmProvider");
  }
  return context;
};

function App() {
  // Verificar variáveis de ambiente antes de renderizar (apenas em desenvolvimento)
  if (!hasEnvironmentVariables && import.meta.env.DEV) {
    return <EnvironmentErrorScreen />;
  }

  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeHomeTab, setActiveHomeTab] = useState<"ministerio" | "recepcao">(
    () => {
      try {
        // Recuperar contexto salvo do localStorage
        const savedContext = localStorage.getItem("call-system-context");
        console.log("Contexto recuperado do localStorage:", savedContext);

        if (savedContext === "recepcao" || savedContext === "ministerio") {
          return savedContext;
        }
      } catch (error) {
        console.error("Erro ao acessar localStorage:", error);
      }

      // Valor padrão se não houver contexto salvo ou houver erro
      return "ministerio";
    }
  );
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotifications();

  const { dialogState, showConfirm } = useConfirmDialog();

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Mostrar contexto carregado apenas uma vez por sessão
      const hasShownWelcome = sessionStorage.getItem("context-welcome-shown");
      if (activeHomeTab === "recepcao" && !hasShownWelcome) {
        showInfo(
          "Contexto carregado",
          "Suas preferências foram restauradas: Recepção"
        );
        sessionStorage.setItem("context-welcome-shown", "true");
      }
    }, 2500); // 2.5 segundos de loading

    return () => clearTimeout(timer);
  }, [activeHomeTab, showInfo]);

  const notificationContextValue = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  const confirmContextValue = {
    showConfirm,
  };

  // Função para salvar o contexto no localStorage
  const handleTabChange = (tab: "ministerio" | "recepcao") => {
    const previousTab = activeHomeTab;

    try {
      // Salvar no localStorage
      localStorage.setItem("call-system-context", tab);
      console.log("Contexto salvo no localStorage:", tab);

      // Verificar se foi salvo corretamente
      const verified = localStorage.getItem("call-system-context");
      console.log("Verificação do localStorage:", verified);
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }

    // Atualizar o estado
    setActiveHomeTab(tab);

    // Mostrar notificação apenas se houve mudança e não é o primeiro carregamento
    if (previousTab !== tab) {
      showInfo(
        `Contexto alterado para ${
          tab === "recepcao" ? "Recepção" : "Ministério Infantil"
        }`,
        "Preferência salva"
      );
    }
  };

  const ministerioNavigation = [
    { id: "home" as Page, name: "Início", icon: Home },
    { id: "attendance" as Page, name: "Chamada", icon: CheckSquare },
    { id: "students" as Page, name: "Alunos", icon: Users },
    { id: "lessons" as Page, name: "Aulas", icon: BookOpen },
    { id: "reports" as Page, name: "Relatórios", icon: BarChart3 },
  ];

  const recepcaoNavigation = [
    { id: "home" as Page, name: "Início", icon: Home },
    { id: "attendance" as Page, name: "Check-in", icon: CheckSquare },
    { id: "students" as Page, name: "Membros", icon: Users },
    { id: "lessons" as Page, name: "Eventos", icon: BookOpen },
    { id: "reports" as Page, name: "Relatórios", icon: BarChart3 },
  ];

  // Usar navegação baseada na aba ativa (mantém contexto em todas as páginas)
  const getNavigation = () => {
    if (activeHomeTab === "recepcao") {
      return recepcaoNavigation;
    }
    return ministerioNavigation;
  };

  const navigation = getNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            onNavigate={setCurrentPage}
            onTabChange={handleTabChange}
            activeTab={activeHomeTab}
          />
        );
      case "students":
        return <StudentsPage context={activeHomeTab} />;
      case "lessons":
        return <LessonsPage context={activeHomeTab} />;
      case "attendance":
        return <AttendancePage context={activeHomeTab} />;
      case "reports":
        return <ReportsPage context={activeHomeTab} />;
      default:
        return (
          <HomePage
            onNavigate={setCurrentPage}
            onTabChange={handleTabChange}
            activeTab={activeHomeTab}
          />
        );
    }
  };

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NotificationContext.Provider value={notificationContextValue}>
      <ConfirmContext.Provider value={confirmContextValue}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <BookOpen
                    className={
                      activeHomeTab === "recepcao"
                        ? "text-teal-600"
                        : "text-blue-600"
                    }
                    size={32}
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {activeHomeTab === "recepcao"
                        ? "Recepção"
                        : "Ministério Infantil"}
                    </h1>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        Sistema de Chamada
                      </p>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activeHomeTab === "recepcao"
                            ? "bg-teal-500"
                            : "bg-blue-500"
                        } animate-pulse`}
                        title="Contexto salvo automaticamente"
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex gap-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          currentPage === item.id
                            ? activeHomeTab === "recepcao"
                              ? "bg-teal-600 text-white"
                              : "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleTabChange("ministerio");
                      showInfo(
                        "Contexto resetado",
                        "Voltou para Ministério Infantil como padrão"
                      );
                    }}
                    className="hidden md:block p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    title="Resetar para Ministério Infantil"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 bg-white">
                <div className="px-4 py-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          currentPage === item.id
                            ? activeHomeTab === "recepcao"
                              ? "bg-teal-600 text-white"
                              : "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={20} />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderPage()}
          </main>

          <NotificationContainer
            notifications={notifications}
            onClose={removeNotification}
          />

          <ConfirmDialog
            isOpen={dialogState.isOpen}
            title={dialogState.title}
            message={dialogState.message}
            confirmText={dialogState.confirmText}
            cancelText={dialogState.cancelText}
            type={dialogState.type}
            onConfirm={dialogState.onConfirm || (() => {})}
            onCancel={dialogState.onCancel || (() => {})}
          />
        </div>
      </ConfirmContext.Provider>
    </NotificationContext.Provider>
  );
}

function AppWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default AppWithProviders;
