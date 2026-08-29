'use client';

import React from 'react';

interface ToastProps {
  msg: string;
  type: 'success' | 'error' | 'info';
}

export default function Toast({ msg, type }: ToastProps) {
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className={`toast ${type}`}>
      <span className="toast-icon">{icon}</span>
      <span className="toast-msg">{msg}</span>
    </div>
  );
}
