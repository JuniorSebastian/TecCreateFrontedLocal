import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// 🔧 Corregir doble slash inicial en la URL antes de montar React
if (window.location.pathname.startsWith('//')) {
  const newPath = window.location.pathname.replace(/^\/+/, '/'); // elimina doble slash inicial
  const newUrl = newPath + window.location.search;
  console.log('🔧 Corrigiendo URL de doble slash:', newUrl);
  window.location.replace(newUrl);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
