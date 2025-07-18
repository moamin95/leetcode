import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Play, X, ChevronDown, ChevronRight } from 'lucide-react';

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

  // Position styles
  const positionStyles = {
    'top-right': { top: '1rem', right: '1rem' },
    'top-left': { top: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' }
  };

  // Base styles
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    ...positionStyles[position]
  };

  const toggleButtonStyle: React.CSSProperties = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '0.875rem'
  };

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '3rem',
    right: '0',
    width: '24rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #e5e7eb'
  };

  const searchContainerStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb'
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem 0.5rem 2.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    outline: 'none'
  };

  const iconButtonStyle: React.CSSProperties = {
    padding: '0.25rem',
    color: '#9ca3af',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s'
  };

  // Get scenario name helper function
  const getScenarioName = (scenario: Scenario | string): string => {
    if (typeof scenario === 'string') return scenario;
    return scenario.name || scenario.id || JSON.stringify(scenario);
  };

  // Fetch scenarios function
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

  // Apply scenario function
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

  // Group scenarios function
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

  // Render scenario item function
  const renderScenarioItem = (scenario: Scenario | string, index: number) => {
    const scenarioName = getScenarioName(scenario);
    const isCurrentScenario = scenarioName === currentScenario;
    
    const itemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderBottom: '1px solid #f3f4f6',
      backgroundColor: isCurrentScenario ? '#dbeafe' : 'transparent'
    };

    const nameStyle: React.CSSProperties = {
      fontWeight: 500,
      color: '#111827',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      flex: 1,
      minWidth: 0
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };

    const actionsStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    };

    const indicatorStyle: React.CSSProperties = {
      width: '0.5rem',
      height: '0.5rem',
      backgroundColor: '#10b981',
      borderRadius: '50%'
    };

    return (
      <div
        key={index}
        style={itemStyle}
        onClick={() => applyScenario(scenario)}
        onMouseEnter={(e) => {
          if (!isCurrentScenario) {
            e.currentTarget.style.backgroundColor = '#eff6ff';
          }
        }}
        onMouseLeave={(e) => {
          if (!isCurrentScenario) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={nameStyle}>{scenarioName}</div>
          {typeof scenario === 'object' && scenario.description && (
            <div style={descriptionStyle}>{scenario.description}</div>
          )}
        </div>
        <div style={actionsStyle}>
          {isCurrentScenario && showCurrentScenario && (
            <div style={indicatorStyle}></div>
          )}
          <Play style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
        </div>
      </div>
    );
  };

  // Render grouped scenarios function
  const renderGroupedScenarios = () => {
    const groups = groupScenariosFunction(filteredScenarios);
    
    return Object.entries(groups).map(([groupName, groupScenarios]) => {
      const isExpanded = expandedGroups.has(groupName);
      
      const groupHeaderStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: '#f9fafb',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        borderBottom: '1px solid #e5e7eb'
      };

      const groupInfoStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      };

      return (
        <div key={groupName}>
          <div
            style={groupHeaderStyle}
            onClick={() => toggleGroup(groupName)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <span style={{ fontWeight: 500, color: '#374151', fontSize: '0.875rem' }}>
              {groupName}
            </span>
            <div style={groupInfoStyle}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                ({groupScenarios.length})
              </span>
              {isExpanded ? 
                <ChevronDown style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} /> : 
                <ChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
              }
            </div>
          </div>
          {isExpanded && (
            <div style={{ backgroundColor: 'white' }}>
              {groupScenarios.map((scenario, index) => renderScenarioItem(scenario, index))}
            </div>
          )}
        </div>
      );
    });
  };

  // Effects
  useEffect(() => {
    fetchScenarios();
  }, []);

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

  // Render component
  return (
    <div style={{ ...containerStyle }} className={className}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={toggleButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1d4ed8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
        }}
      >
        <Play style={{ width: '1rem', height: '1rem' }} />
        <span>Scenarios</span>
        {currentScenario !== 'default' && showCurrentScenario && (
          <div style={{
            width: '0.5rem',
            height: '0.5rem',
            backgroundColor: '#34d399',
            borderRadius: '50%'
          }}></div>
        )}
      </button>

      {/* Scenario Panel */}
      {isOpen && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 500, color: '#111827', margin: 0, fontSize: '1rem' }}>
                Parrot Scenarios
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={fetchScenarios}
                  disabled={loading}
                  style={{
                    ...iconButtonStyle,
                    opacity: loading ? 0.5 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <RefreshCw style={{
                    width: '1rem',
                    height: '1rem',
                    animation: loading ? 'spin 1s linear infinite' : 'none'
                  }} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={iconButtonStyle}
                >
                  <X style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={searchContainerStyle}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                width: '1rem',
                height: '1rem'
              }} />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderBottom: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{error}</div>
            </div>
          )}

          {/* Scenarios List */}
          <div style={{ maxHeight, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <RefreshCw style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  margin: '0 auto 0.5rem',
                  color: '#9ca3af',
                  animation: 'spin 1s linear infinite'
                }} />
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading scenarios...</div>
              </div>
            ) : filteredScenarios.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                {searchTerm ? 'No scenarios match your search' : 'No scenarios available'}
              </div>
            ) : (
              renderGroupedScenarios()
            )}
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '0.75rem 1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <span>Total: {filteredScenarios.length} scenarios</span>
              {showCurrentScenario && <span>Current: {currentScenario}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ParrotScenarioSwitcher;