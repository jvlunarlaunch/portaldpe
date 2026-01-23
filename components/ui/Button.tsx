import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseStyles = "relative inline-flex items-center justify-center font-medium font-display tracking-wide transition-all duration-300 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--color-primary-glow)] hover:shadow-[0_0_25px_-5px_var(--color-primary-glow)]",
    secondary: "bg-surface border border-white/10 text-white backdrop-blur-md hover:bg-white/5 hover:border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
    ghost: "text-text-muted hover:text-white hover:bg-white/5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};