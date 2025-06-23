import React from 'react';
import { AppState } from '../../types';
import AvailableState from './AvailableState';
import MatchedState from './MatchedState';
import FrozenState from './FrozenState';
import ChattingState from './ChattingState';
import { Middleware } from "../../../middleware"
import { useLocation } from 'react-router-dom';

interface DashboardProps {
  appState: AppState;
  onStartChat: () => void;
  onUnpinMatch: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appState, onStartChat, onUnpinMatch }) => {

   const location = useLocation()
  
    Middleware(location.pathname)
  




  const renderCurrentState = () => {
    switch (appState.userState) {
      case 'available':
        return <AvailableState />;
      case 'matched':
        return (
          <MatchedState 
            match={appState.currentMatch!} 
            onStartChat={onStartChat}
            onUnpinMatch={onUnpinMatch}
          />
        );
      case 'frozen':
        return (
          <FrozenState 
            freezeEndTime={appState.freezeEndTime!}
          />
        );
      case 'chatting':
        return <ChattingState match={appState.currentMatch!} />;
      default:
        return <AvailableState />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-primary-50 pb-20">
      {renderCurrentState()}
    </div>
  );
};

export default Dashboard;