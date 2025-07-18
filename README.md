# leetcode
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Play, X, ChevronDown, ChevronRight } from 'lucide-react';
import './ParrotScenarioSwitcher.css';

export interface Scenario {
  id?: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

export interface ParrotScenarioSwitcherProps {
  /** Base URL for your parrot server (default: http://localhost:3002) */
  baseUrl?: string;
  /** Endpoint path for scenarios (default: /parrot/scenarios) */
  scenariosEndpoint?: string;
  /** Custom CSS classes for styling */
  className?: string;
  /** Position of the switcher button */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Whether to show the current scenario indicator */
  showCurrentScenario?: boolean;
  /** Whether to reload the page after applying a scenario */
  autoReload?: boolean;
  /** Custom function to handle scenario application */
  onScenarioApply?: (scenario: Scenario | string) => Promise<void>;
  /** Custom function to fetch scenarios */
  onFetchScenarios?: () => Promise<(Scenario | string)[]>;
  /** Maximum height of the scenarios list */
  maxHeight?: string;
  /** Whether to group scenarios by path */
  groupScenarios?: boolean;
}

const ParrotScenarioSwitcher: React.FC<ParrotScenarioSwitcherProps> = ({
  baseUrl = 'http://localhost:3002',
  scenariosEndpoint = '/parrot/scenarios',
  className = '',
  position = 'top-right',
  showCurrentScenario = true,
  autoReload = true,
  onScenarioApply,
  onFetchScenarios,
  maxHeight = '24rem',
  groupScenarios = true
}) => {
  const [scenarios, setScenarios] = useState<(Scenario | string)[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<(Scenario | string)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('default');
  const [error, setError] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set<string>());

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Fetch scenarios
  const fetchScenarios = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: (Scenario | string)[];
      
      if (onFetchScenarios) {
        data = await onFetchScenarios();
      } else {
        const response = await fetch(`${baseUrl}${scenariosEndpoint}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        data = await response.json();
      }
      
      setScenarios(data);
      setFilteredScenarios(data);
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
      setError('Failed to load scenarios. Make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load scenarios when component mounts
  useEffect(() => {
    fetchScenarios();
  }, []);

  // Filter scenarios based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredScenarios(scenarios);
      return;
    }

    const filtered = scenarios.filter(scenario => 
      getScenarioName(scenario).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredScenarios(filtered);
  }, [searchTerm, scenarios]);

  // Get scenario name
  const getScenarioName = (scenario: Scenario | string): string => {
    if (typeof scenario === 'string') return scenario;
    return scenario.name || scenario.id || JSON.stringify(scenario);
  };

  // Apply scenario
  const applyScenario = async (scenario: Scenario | string) => {
    try {
      setLoading(true);
      setError('');
      
      if (onScenarioApply) {
        await onScenarioApply(scenario);
      } else {
        const scenarioId = getScenarioName(scenario);
        
        const response = await fetch(`${baseUrl}${scenariosEndpoint}/${scenarioId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to apply scenario: ${response.status}`);
        }
      }

      const scenarioName = getScenarioName(scenario);
      setCurrentScenario(scenarioName);
      setIsOpen(false);
      
      if (autoReload) {
        window.location.reload();
      }
      
    } catch (err) {
      console.error('Failed to apply scenario:', err);
      setError('Failed to apply scenario. Check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Group scenarios
  const groupScenariosFunction = (scenarios: (Scenario | string)[]) => {
    if (!groupScenarios) {
      return { 'All Scenarios': scenarios };
    }

    const groups: { [key: string]: (Scenario | string)[] } = {};
    
    scenarios.forEach(scenario => {
      const scenarioName = getScenarioName(scenario);
      const parts = scenarioName.split('/');
      const groupName = parts.length > 1 ? parts[0] : 'General';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(scenario);
    });
    
    return groups;
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const renderScenarioItem = (scenario: Scenario | string, index: number) => {
    const scenarioName = getScenarioName(scenario);
    const isCurrentScenario = scenarioName === currentScenario;
    
    return (
      <div
        key={index}
        className={`pss-scenario-item ${isCurrentScenario ? 'pss-scenario-item--active' : ''}`}
        onClick={() => applyScenario(scenario)}
      >
        <div className="pss-scenario-content">
          <div className="pss-scenario-name">{scenarioName}</div>
          {typeof scenario === 'object' && scenario.description && (
            <div className="pss-scenario-description">{scenario.description}</div>
          )}
        </div>
        <div className="pss-scenario-actions">
          {isCurrentScenario && showCurrentScenario && (
            <div className="pss-current-indicator"></div>
          )}
          <Play className="pss-icon pss-play-icon" />
        </div>
      </div>
    );
  };

  const renderGroupedScenarios = () => {
    const groups = groupScenariosFunction(filteredScenarios);
    
    return Object.entries(groups).map(([groupName, groupScenarios]) => (
      <div key={groupName} className="pss-group">
        <div
          className="pss-group-header"
          onClick={() => toggleGroup(groupName)}
        >
          <span className="pss-group-name">{groupName}</span>
          <div className="pss-group-info">
            <span className="pss-group-count">({groupScenarios.length})</span>
            {expandedGroups.has(groupName) ? 
              <ChevronDown className="pss-icon pss-chevron-icon" /> : 
              <ChevronRight className="pss-icon pss-chevron-icon" />
            }
          </div>
        </div>
        {expandedGroups.has(groupName) && (
          <div className="pss-group-content">
            {groupScenarios.map((scenario, index) => renderScenarioItem(scenario, index))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`pss-container ${positionClasses[position]} ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pss-toggle-button"
      >
        <Play className="pss-icon" />
        <span>Scenarios</span>
        {currentScenario !== 'default' && showCurrentScenario && (
          <div className="pss-active-indicator"></div>
        )}
      </button>

      {/* Scenario Panel */}
      {isOpen && (
        <div className="pss-panel">
          {/* Header */}
          <div className="pss-header">
            <div className="pss-header-content">
              <h3 className="pss-title">Parrot Scenarios</h3>
              <div className="pss-header-actions">
                <button
                  onClick={fetchScenarios}
                  disabled={loading}
                  className="pss-icon-button"
                >
                  <RefreshCw className={`pss-icon ${loading ? 'pss-spinning' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="pss-icon-button"
                >
                  <X className="pss-icon" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pss-search-container">
            <div className="pss-search-wrapper">
              <Search className="pss-icon pss-search-icon" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pss-search-input"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="pss-error">
              <div className="pss-error-text">{error}</div>
            </div>
          )}

          {/* Scenarios List */}
          <div className="pss-scenarios-list" style={{ maxHeight }}>
            {loading ? (
              <div className="pss-loading">
                <RefreshCw className="pss-icon pss-spinning pss-loading-icon" />
                <div className="pss-loading-text">Loading scenarios...</div>
              </div>
            ) : filteredScenarios.length === 0 ? (
              <div className="pss-empty">
                {searchTerm ? 'No scenarios match your search' : 'No scenarios available'}
              </div>
            ) : (
              renderGroupedScenarios()
            )}
          </div>

          {/* Footer */}
          <div className="pss-footer">
            <div className="pss-footer-content">
              <span>Total: {filteredScenarios.length} scenarios</span>
              {showCurrentScenario && <span>Current: {currentScenario}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParrotScenarioSwitcher;
