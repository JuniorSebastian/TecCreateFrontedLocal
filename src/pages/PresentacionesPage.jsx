// src/pages/PresentacionesPage.jsx
import React from 'react';
import PresentacionesList from '../components/PresentacionesList';
import NuevaPresentacion from '../components/NuevaPresentacion';
import { Button } from '@/components/ui/Button';

export default function PresentacionesPage() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Gestión de Presentaciones</h1>
      <NuevaPresentacion />
      <PresentacionesList />
    </div>
  );
}
