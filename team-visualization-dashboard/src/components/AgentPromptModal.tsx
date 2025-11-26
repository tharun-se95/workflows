import { useState } from 'react';
import { AgentInfo } from '../types/types';
import { PromptTemplate } from '../types/templates';
import { PromptTemplates } from './PromptTemplates';
import { agentInfo } from '../utils/agentInfo';

interface AgentPromptModalProps {
  agent: AgentInfo;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => Promise<void>;
}

export const AgentPromptModal = ({ agent, isOpen, onClose, onSubmit }: AgentPromptModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [assignee, setAssignee] = useState<string>(agent.id);
  const [assignedTo, setAssignedTo] = useState<string>('user');
  const [reportTo, setReportTo] = useState<string>('user');

  const handleTemplateSelect = (template: PromptTemplate) => {
    // Fill template variables (simplified - in real app would show variable input modal)
    let filledPrompt = template.template;
    
    // Replace variables with placeholders for user to fill
    template.variables.forEach(variable => {
      filledPrompt = filledPrompt.replace(
        new RegExp(`\\{${variable}\\}`, 'g'),
        `[${variable}]`
      );
    });
    
    setPrompt(filledPrompt);
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    try {
      // Track template usage if template was used
      if (selectedTemplate) {
        try {
          await fetch(`http://localhost:3001/api/prompt-templates/${selectedTemplate.id}/use`, {
            method: 'POST',
          });
        } catch (err) {
          // Ignore tracking errors
        }
      }
      
      await onSubmit(prompt, assignee, assignedTo, reportTo);
      setPrompt('');
      setSelectedTemplate(null);
      setAssignee(agent.id);
      setAssignedTo('user');
      setReportTo('user');
      onClose();
    } catch (error) {
      console.error('Error submitting prompt:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create task list. Make sure the API server is running on http://localhost:3001'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{agent.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-white">Assign Task to {agent.name}</h2>
              <p className="text-blue-100 text-sm">{agent.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Enter task description or prompt:
              </label>
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <span>📋</span>
                <span>Use Template</span>
              </button>
            </div>
            {selectedTemplate && (
              <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                Using template: <strong>{selectedTemplate.name}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setPrompt('');
                  }}
                  className="ml-2 text-purple-500 hover:text-purple-700"
                >
                  Clear
                </button>
              </div>
            )}
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Example: "Build a login component with email and password fields" or "Create API endpoint for user authentication"\n\nOr click "Use Template" to select from pre-built templates.`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              disabled={isSubmitting}
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500">
              {selectedTemplate 
                ? 'Fill in the template variables (marked with [brackets]) and submit.'
                : 'The agent will analyze your prompt and create a list of tasks to execute.'}
            </p>
          </div>

          {/* Task Assignment Fields */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                👤 Assignee
              </label>
              <select
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={isSubmitting}
              >
                {agentInfo.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Who will work on tasks</p>
            </div>

            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                📋 Assigned By
              </label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={isSubmitting}
              >
                <option value="user">👤 User</option>
                {agentInfo.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Who assigned the tasks</p>
            </div>

            <div>
              <label htmlFor="reportTo" className="block text-sm font-medium text-gray-700 mb-1">
                📊 Report To
              </label>
              <select
                id="reportTo"
                value={reportTo}
                onChange={(e) => setReportTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={isSubmitting}
              >
                <option value="user">👤 User</option>
                {agentInfo.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Who receives updates</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!prompt.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <span>Create Task List</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Prompt Templates Modal */}
      {showTemplates && (
        <PromptTemplates
          agentType={agent.id}
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

