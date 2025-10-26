import React from 'react';

export default function SidebarLink({ icon, text, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center gap-3 pl-6 pr-4 py-3 rounded-xl w-full text-left font-semibold transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-blue-50 via-white to-blue-50 text-blue-700 shadow-md'
          : 'text-gray-700 hover:bg-white hover:shadow-md'
      }`}
    >
      {active && (
        <span className="absolute inset-y-2 left-2 w-1 rounded-full bg-gradient-to-b from-blue-500 via-cyan-400 to-sky-500 shadow-sm animate-pulse"></span>
      )}
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all duration-300 ${
          active
            ? 'bg-white/80 text-blue-600 shadow-inner'
            : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100 group-hover:text-blue-600'
        }`}
      >
        {icon}
      </span>
      <span className="relative">
        {text}
        <span className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
      </span>
    </button>
  );
}
