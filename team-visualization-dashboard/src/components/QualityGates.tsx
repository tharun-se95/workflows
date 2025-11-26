import { QualityGates } from '../types/types';

interface QualityGatesProps {
  gates: QualityGates;
}

export const QualityGatesComponent = ({ gates }: QualityGatesProps) => {
  const getGateColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getGateIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'pending':
      default:
        return '⏳';
    }
  };

  const gatesList = Object.entries(gates).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    status: value
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 w-full h-full overflow-hidden flex flex-col">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex-shrink-0">Quality Gates</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1 content-start">
        {gatesList.map((gate) => (
          <div
            key={gate.name}
            className={`p-2 sm:p-3 rounded-lg border-2 ${getGateColor(gate.status)} flex items-center gap-2 min-w-0`}
          >
            <span className="text-base sm:text-lg flex-shrink-0">{getGateIcon(gate.status)}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs sm:text-sm truncate">{gate.name}</p>
              <p className="text-xs opacity-75 truncate capitalize">{gate.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

