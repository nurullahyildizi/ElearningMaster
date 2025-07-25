import React from 'react';
import { View, DigitalTwinMode, AppState } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LearningPath from './components/LearningPath';
import Career from './components/Career';
import Community from './components/Community';
import Modal from './components/Modal';
import AiBot from './components/AiBot';
import CourseView from './components/CourseView';
import { Sparkles, CheckCircle, Award, Trophy, Settings, Gem, Ticket, Loader2, AlertTriangle, XCircle, Mic } from 'lucide-react';
import AdminPanel from './components/admin/AdminPanel';
import TeamCockpit from './components/TeamCockpit';
import ExpertsView from './components/ExpertsView';
import EventsView from './components/EventsView';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ComingSoonSim from './components/simulations/ComingSoonSim';
import AevoSim from './components/simulations/AevoSim';
import DigitalTwinSim from './components/simulations/DigitalTwinSim';
import MeisterProjectSim from './components/simulations/MeisterProjectSim';
import TroubleshootingSim from './components/simulations/TroubleshootingSim';
import PlanningSim from './components/simulations/PlanningSim';
import { PLANNING_SCENARIOS, SIM_DATA } from './constants';
import { useAuth } from './hooks/useAppContext';
import { useData } from './hooks/useAppContext';
import { useUI } from './hooks/useAppContext';
import SocialView from './components/social/SocialView';
import LearningRoomView from './components/social/LearningRoomView';


// Error Boundary for Simulations
class SimulationErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("Simulation Error Caught:", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in simulation:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 bg-red-900/50 text-white rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-2xl font-bold">Ein Fehler ist aufgetreten.</h3>
          <p className="text-red-300 mt-2 mb-6">Die Simulation konnte nicht geladen werden oder ist abgestürzt.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg"
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
    const { appState, currentUser, login, register, logout } = useAuth();
    const { 
        view, setView, modalState, toast, 
        closeModal
    } = useUI();
    const {
        mergedLearningPaths,
        allSkillNodes,
        handleNodeClick, handleStartSimulationFromDashboard
    } = useData();

    const renderContent = () => {
        if (appState === 'loading') {
            return (
                <div className="flex items-center justify-center h-full w-full">
                    <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                </div>
            );
        }
        
        if (appState === 'landing') {
            if (view === View.Login) {
                return <LoginPage onLogin={login} onNavigateToRegister={() => setView(View.Register)} />;
            }
            if (view === View.Register) {
                return <RegisterPage onRegister={register} onNavigateToLogin={() => setView(View.Login)} />;
            }
            return <LandingPage onNavigateToRegister={() => setView(View.Register)} onNavigateToLogin={() => setView(View.Login)} />;
        }

        if (appState === 'authenticated' && currentUser) {
            
            const findFirstActiveNode = () => {
              for (const path of Object.values(mergedLearningPaths)) {
                  const activeNode = path.nodes.flatMap(n => n.children ? [n, ...n.children] : [n]).find(n => n.status === 'active');
                  if (activeNode) return {node: activeNode, pathId: path.id};
              }
              return undefined;
            }
            const firstActive = findFirstActiveNode();


            if (view === View.Admin && currentUser.role === 'meister') {
                 return <AdminPanel onExit={() => setView(View.Dashboard)} />;
            }
            
            if (view === View.Course) {
                 // The course view logic is now handled within the DataContext/handleNodeClick
                 // This is a simplified representation. A real router would be better.
                 // For now, if view is course, we expect a course to be active.
                 // Let's find the current course from data context
                 const { currentCourse } = useData();
                 const activeCourseNode = currentCourse ? allSkillNodes.find(n => n.id === currentCourse.id) : undefined;
                 
                 if (activeCourseNode) {
                      return (
                         <div className="flex h-screen bg-slate-950">
                             <Sidebar />
                             <main className="flex-1 p-8 overflow-y-auto">
                                <Header />
                                <CourseView courseNode={activeCourseNode} coursePathId={currentCourse!.pathId} />
                             </main>
                             <AiBot />
                         </div>
                      );
                 }
            }

            if (view === View.LearningRoom) {
                return <LearningRoomView />;
            }
            

            return (
                <div className="flex h-screen bg-slate-950">
                    <Sidebar />
                    <main className="flex-1 p-8 overflow-y-auto">
                        <Header />
                        
                        {view === View.Dashboard && <Dashboard activeCourse={firstActive?.node} onStartCourse={() => firstActive && handleNodeClick(firstActive.node, firstActive.pathId)} onStartSimulation={handleStartSimulationFromDashboard} />}
                        {view === View.LearningPath && <LearningPath />}
                        {view === View.Career && <Career />}
                        {view === View.Community && <Community />}
                        {view === View.Social && <SocialView />}
                        {view === View.Gilde && <TeamCockpit />}
                        {view === View.Experts && <ExpertsView />}
                        {view === View.Events && <EventsView />}
                    </main>
                    <AiBot />
                </div>
            );
        }
        
        return <LandingPage onNavigateToRegister={() => setView(View.Register)} onNavigateToLogin={() => setView(View.Login)} />;
    };
    
    const { Toast } = useUI();

    return (
        <>
            {renderContent()}
            <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title} size={modalState.size}>
                {modalState.content}
            </Modal>
            {toast && <Toast notification={toast.notification} type={toast.type} />}
        </>
    );
};

export default App;