// Atom: Checkbox
import React, { InputHTMLAttributes } from "react";
import { colors, typography } from "../../config";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  wrapperClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, wrapperClassName = "", ...props }, ref) => (
    <label
      className={`flex cursor-pointer items-start gap-2.5 ${wrapperClassName}`}
    >
      <input
        ref={ref}
        type="checkbox"
        {...props}
        className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded ${props.className || ""}`}
        style={{ accentColor: colors.purple[500], ...(props.style || {}) }}
      />
      <span
        className="text-sm leading-snug"
        style={{ color: colors.brown[800], fontFamily: typography.fontFamily }}
      >
        {label}
      </span>
    </label>
  ),
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
