import { useState, createContext, useContext } from 'react';
import { Users, BookOpen, CheckSquare, BarChart3, Menu, X, Home } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { StudentsPage } from './pages/StudentsPage';
import { LessonsPage } from './pages/LessonsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationContainer } from './components/NotificationContainer';
import { useNotifications } from './hooks/useNotifications';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useConfirmDialog } from './hooks/useConfirmDialog';

type Page = 'home' | 'students' | 'lessons' | 'attendance' | 'reports';

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
    throw new Error('useNotificationContext must be used within a NotificationProvider');
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
    type?: 'danger' | 'warning' | 'info';
  }) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirmContext = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmContext must be used within a ConfirmProvider');
  }
  return context;
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  } = useNotifications();

  const { dialogState, showConfirm } = useConfirmDialog();

  const notificationContextValue = {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  const confirmContextValue = {
    showConfirm
  };

  const navigation = [
    { id: 'home' as Page, name: 'Início', icon: Home },
    { id: 'attendance' as Page, name: 'Chamada', icon: CheckSquare },
    { id: 'students' as Page, name: 'Alunos', icon: Users },
    { id: 'lessons' as Page, name: 'Aulas', icon: BookOpen },
    { id: 'reports' as Page, name: 'Relatórios', icon: BarChart3 },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'students':
        return <StudentsPage />;
      case 'lessons':
        return <LessonsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <NotificationContext.Provider value={notificationContextValue}>
      <ConfirmContext.Provider value={confirmContextValue}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <BookOpen className="text-blue-600" size={32} />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Ministério Infantil</h1>
                  <p className="text-xs text-gray-500">Sistema de Chamada</p>
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
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
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
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
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

export default App;
