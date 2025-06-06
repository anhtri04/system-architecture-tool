import React, { Component } from 'react';
import Home from './pages/Home.jsx';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center text-red-600">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p>{this.state.error?.message || 'Unknown error'}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <div className="w-full h-screen bg-gray-50 flex">
        <Home />
      </div>
    </ErrorBoundary>
  );
};

export default App;