// Atom: Select
import React, { SelectHTMLAttributes, ReactNode } from "react";
import { colors, typography, radii } from "../../config";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  children: ReactNode;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      labelClassName = "",
      wrapperClassName = "",
      children,
      error,
      ...props
    },
    ref,
  ) => (
    <div className={wrapperClassName}>
      {label && (
        <label
          className={`text-xs font-semibold uppercase tracking-wide mb-1 block ${labelClassName}`}
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          {label}
          {props.required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none ${props.className || ""} ${error ? "border-red-500" : ""}`}
        style={{
          borderColor: error ? colors.red[500] : colors.brown[100],
          background: props.disabled ? "#d1d5db" : "#ffffff",
          color: props.disabled ? "#6b7280" : "#1a1333",
          WebkitTextFillColor: props.disabled ? "#6b7280" : "#1a1333",
          colorScheme: "light",
          cursor: props.disabled ? "not-allowed" : undefined,
          fontFamily: typography.fontFamily,
          borderRadius: radii.md,
          ...(props.style || {}),
        }}
      >
        {children}
      </select>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  ),
);

Select.displayName = "Select";
export default Select;
