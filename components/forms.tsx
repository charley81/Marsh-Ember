import type { ReactNode, Ref } from "react";

export function FormFieldShell({ label, name, help, error, required = false, full = false, children }: {
  label: string;
  name: string;
  help?: string;
  error?: string;
  required?: boolean;
  full?: boolean;
  children: ReactNode;
}) {
  const helpId = help ? `${name}-help` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  return <div className={`field${full ? " field--full" : ""}${error ? " field--error" : ""}`}><label htmlFor={name}>{label}{required ? <><span aria-hidden="true"> *</span><span className="sr-only"> (required)</span></> : null}</label>{children}{help ? <p id={helpId} className="field__help">{help}</p> : null}{error ? <p id={errorId} className="field__error"><span aria-hidden="true">! </span>{error}</p> : null}</div>;
}

export function FormStatus({ title, message, type, role, titleId, titleRef, titleTabIndex }: {
  title: string;
  message: string;
  type: "loading" | "error" | "success";
  role?: "status" | "alert";
  titleId?: string;
  titleRef?: Ref<HTMLHeadingElement>;
  titleTabIndex?: number;
}) {
  const icon = type === "loading" ? "○" : type === "success" ? "✓" : "!";
  return <div className={`form-status form-status--${type}`} role={role} aria-live={role === "status" ? "polite" : undefined}><span aria-hidden="true">{icon}</span><div><h3 id={titleId} ref={titleRef} tabIndex={titleTabIndex}>{title}</h3><p>{message}</p></div></div>;
}
