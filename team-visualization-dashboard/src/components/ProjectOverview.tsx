import { Project } from '../types/types';

interface ProjectOverviewProps {
  project: Project;
}

export const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  const statusLabel = project.status === 'in-progress' ? 'In Progress' : project.status === 'completed' ? 'Completed' : 'Planning';
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full border border-blue-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate w-full sm:w-auto">{project.name}</h2>
        <span 
          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            project.status === 'in-progress' 
              ? 'bg-blue-100 text-blue-800 animate-pulse' 
              : project.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
          aria-label={`Project status: ${statusLabel}`}
        >
          {statusLabel}
        </span>
      </div>
      <p className="text-sm sm:text-base text-gray-700 mb-3 font-medium break-words">{project.description}</p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <span className="text-gray-600">Phase: <strong className="text-gray-900 font-semibold">{project.currentPhase}</strong></span>
        <span className="hidden sm:inline text-gray-400" aria-hidden="true">|</span>
        <span className="text-gray-600">Last Updated: <strong className="text-gray-900">{new Date().toLocaleTimeString()}</strong></span>
      </div>
    </div>
  );
};

