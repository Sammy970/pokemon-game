import React from 'react';

interface BattleLogProps {
  messages: string[];
  logRef: React.RefObject<HTMLDivElement>;
}

const BattleLog: React.FC<BattleLogProps> = ({ messages, logRef }) => {
  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-4">
      <h3 className="font-bold text-lg mb-2">Battle Log</h3>
      <div
        ref={logRef}
        className="h-40 overflow-y-auto border p-2 rounded"
      >
        {messages.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleLog;
