import React from 'react';

export default function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
