import { useState } from "react";
import type { PixKeyType } from "@/api/referrals/schema";
import {
  emptyPixWithdrawalFormValues,
  maskPixKeyInput,
  pixWithdrawalFormSchema,
  toSubmittablePixKey,
  type PixWithdrawalFormValues,
} from "../model/pix-withdrawal-form";

type PixWithdrawalFormErrors = Partial<
  Record<keyof PixWithdrawalFormValues, string>
>;

interface UsePixWithdrawalFormProps {
  onSuccess: (values: {
    pixKey: string;
    pixKeyType: PixKeyType;
  }) => Promise<void>;
}

export function usePixWithdrawalForm({ onSuccess }: UsePixWithdrawalFormProps) {
  const [form, setForm] = useState<PixWithdrawalFormValues>(
    emptyPixWithdrawalFormValues,
  );
  const [errors, setErrors] = useState<PixWithdrawalFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updatePixKeyType(pixKeyType: PixKeyType) {
    setForm({ pixKeyType, pixKey: "" });
    setErrors({});
  }

  function updatePixKey(rawValue: string) {
    setForm((prev) => ({
      ...prev,
      pixKey: maskPixKeyInput(prev.pixKeyType, rawValue),
    }));
    if (errors.pixKey) {
      setErrors((prev) => ({ ...prev, pixKey: undefined }));
    }
  }

  function reset() {
    setForm(emptyPixWithdrawalFormValues);
    setErrors({});
  }

  function validate(): PixWithdrawalFormValues | null {
    const parsed = pixWithdrawalFormSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: PixWithdrawalFormErrors = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof PixWithdrawalFormErrors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }

      setErrors(fieldErrors);
      return null;
    }

    setErrors({});
    return parsed.data;
  }

  function getSubmittableValues(): {
    pixKey: string;
    pixKeyType: PixKeyType;
  } | null {
    const parsed = validate();
    if (!parsed) return null;

    return {
      pixKey: toSubmittablePixKey(parsed.pixKeyType, parsed.pixKey),
      pixKeyType: parsed.pixKeyType,
    };
  }

  async function submit() {
    const values = getSubmittableValues();
    if (!values) return;

    setSubmitting(true);

    try {
      await onSuccess(values);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    errors,
    submitting,
    updatePixKeyType,
    updatePixKey,
    validate,
    getSubmittableValues,
    submit,
    reset,
  };
}
