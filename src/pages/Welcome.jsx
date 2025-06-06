import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Calculator } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  const handleNewDiagram = () => {
    localStorage.removeItem('initialDiagram');
    navigate('/design');
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const diagram = JSON.parse(event.target.result);
        if (!diagram.components || !diagram.connections || !diagram.nextId) {
          alert('Invalid diagram file');
          return;
        }
        localStorage.setItem('initialDiagram', JSON.stringify(diagram));
        navigate('/design');
      } catch (err) {
        alert('Error loading diagram: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center transform hover:scale-105 transition-transform duration-300">
        <div className="flex justify-center mb-6">
          <Calculator className="w-16 h-16 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to System Design Tool
        </h1>
        <p className="text-gray-600 mb-8">
          Design and visualize your system architecture with ease. Start a new diagram or load an existing one to continue your work.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleNewDiagram}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Diagram
          </button>
          <label className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md cursor-pointer">
            <Upload className="w-5 h-5" />
            Load Diagram
            <input
              type="file"
              accept=".json"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
      <footer className="mt-8 text-gray-500 text-sm">
        © 2025 System Design Tool. All rights reserved.
      </footer>
    </div>
  );
};

export default Welcome;