import React, { ButtonHTMLAttributes } from "react";
import { typography, radii } from "../../config";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const baseStyles = `flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none`;
const variants = {
  primary: `bg-gradient-to-tr from-[#4F2D9B] via-[#7B3FF2] to-[#D4AF37] text-white hover:opacity-95`,
  secondary: `border border-[#3a2f5e] bg-[#19142b] text-[#f5f2ff] hover:bg-[#231a3b]`,
  danger: `bg-[#b4233f] text-white hover:bg-[#951c34]`,
  outline: `border border-[#3a2f5e] text-[#e8e2ff] bg-transparent hover:bg-[#1a142a]`,
};
const sizes = {
  sm: `px-3 py-1.5 text-xs`,
  md: `px-4 py-2.5 text-sm`,
  lg: `px-6 py-3 text-base`,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading,
      children,
      className = "",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        fontFamily: typography.fontFamily,
        borderRadius: radii.md,
        ...props.style,
      }}
      disabled={loading || props.disabled}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {loading ? "Carregando..." : children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  ),
);

Button.displayName = "Button";
export default Button;
