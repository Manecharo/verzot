import React, { useState } from 'react';
import apiTest from '../../utils/apiTest';
import { useSafeTranslation } from '../../utils/safeTranslation';

const ApiTester = () => {
  const { t } = useSafeTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('connection');
  
  // Test sample data
  const sampleTournament = {
    name: "Test Tournament",
    description: "A test tournament for API diagnostics",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    format: "11-a-side",
    maxTeams: 8,
    minTeams: 2,
    isPublic: true
  };
  
  const sampleTeam = {
    name: "Test Team",
    description: "A test team for API diagnostics",
    homeLocation: "Test Location",
    foundedYear: new Date().getFullYear()
  };
  
  // Run connection test
  const runConnectionTest = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const testResults = await apiTest.testApiConnection();
      setResults(testResults);
    } catch (error) {
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run tournament creation test
  const runTournamentTest = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const testResults = await apiTest.testCreateTournament(sampleTournament);
      setResults(testResults);
    } catch (error) {
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run team creation test
  const runTeamTest = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const testResults = await apiTest.testCreateTeam(sampleTeam);
      setResults(testResults);
    } catch (error) {
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Diagnostic Tool</h1>
      
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
        <p>This tool helps diagnose API connectivity issues. Use it to test various API endpoints and operations.</p>
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-300">
          <button 
            className={`py-2 px-4 mr-2 ${activeTab === 'connection' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('connection')}
          >
            Connection Test
          </button>
          <button 
            className={`py-2 px-4 mr-2 ${activeTab === 'tournament' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('tournament')}
          >
            Tournament Test
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'team' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Test
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        {activeTab === 'connection' && (
          <div>
            <h2 className="text-xl mb-2">API Connection Test</h2>
            <p className="mb-4">Tests basic connectivity to the API and checks several key endpoints.</p>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={runConnectionTest}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Run Connection Test'}
            </button>
          </div>
        )}
        
        {activeTab === 'tournament' && (
          <div>
            <h2 className="text-xl mb-2">Tournament Creation Test</h2>
            <p className="mb-4">Tests the ability to create a tournament.</p>
            <pre className="bg-gray-100 p-2 mb-4 overflow-x-auto">
              {JSON.stringify(sampleTournament, null, 2)}
            </pre>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={runTournamentTest}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Run Tournament Test'}
            </button>
          </div>
        )}
        
        {activeTab === 'team' && (
          <div>
            <h2 className="text-xl mb-2">Team Creation Test</h2>
            <p className="mb-4">Tests the ability to create a team.</p>
            <pre className="bg-gray-100 p-2 mb-4 overflow-x-auto">
              {JSON.stringify(sampleTeam, null, 2)}
            </pre>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={runTeamTest}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Run Team Test'}
            </button>
          </div>
        )}
      </div>
      
      {results && (
        <div className="mt-6">
          <h2 className="text-xl mb-2">Test Results</h2>
          <div className="p-4 rounded bg-gray-100">
            <pre className="overflow-x-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTester; 