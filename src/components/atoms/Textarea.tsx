// Atom: Textarea
import React, { TextareaHTMLAttributes } from "react";
import { colors, typography, radii } from "../../config";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, labelClassName = "", wrapperClassName = "", ...props }, ref) => (
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
      <textarea
        ref={ref}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none ${props.className || ""}`}
        style={{
          borderColor: colors.brown[100],
          background: props.disabled ? "#d1d5db" : "#ffffff",
          color: props.disabled ? "#6b7280" : "#1a1333",
          WebkitTextFillColor: props.disabled ? "#6b7280" : "#1a1333",
          colorScheme: "light",
          cursor: props.disabled ? "not-allowed" : undefined,
          fontFamily: typography.fontFamily,
          borderRadius: radii.md,
          ...(props.style || {}),
        }}
      />
    </div>
  ),
);

Textarea.displayName = "Textarea";
export default Textarea;
