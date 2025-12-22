import React from 'react';

// Button Component - Modern, Soft Rounded, Gradient
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger', size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white";
  
  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 border border-transparent",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-emerald-600 shadow-sm",
    outline: "bg-transparent text-gray-600 border border-gray-300 hover:border-emerald-500 hover:text-emerald-600",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Card Component - Glassmorphism
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
};

// Badge Component
export const Badge: React.FC<{ children: React.ReactNode, type?: 'success' | 'warning' | 'error' | 'info' }> = ({ children, type = 'info' }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${styles[type]}`}>
      {children}
    </span>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input 
      {...props}
      className={`w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${props.className || ''}`}
    />
  );
}