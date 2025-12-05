import React from "react";
import { AppState } from "../../types";
import AvailableState from "./AvailableState";
import MatchedState from "./MatchedState";
import FrozenState from "./FrozenState";
import ChattingState from "./ChattingState";
interface DashboardProps {
  appState: AppState;
  onStartChat: () => void;
  onUnpinMatch: () => void;
  status: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({
  appState,
  onStartChat,
  status,
  onUnpinMatch,
}) => {

  

  const renderCurrentState = () => {
    const now = new Date();
    const dateAfter24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log("date now from 24 hours", dateAfter24Hours);

    switch (status) {
      case "available":
        return <AvailableState />;
      case "matched":
        return (
          <MatchedState
            match={appState.currentMatch!}
            onStartChat={onStartChat}
            onUnpinMatch={onUnpinMatch}
          />
        );
      case "frozen":
        return <FrozenState freezeEndTime={dateAfter24Hours} />;
      case "chatting":
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
