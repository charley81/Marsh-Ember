import type { ReactNode } from "react";

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

export function FormStatus({ title, message, type, role }: {
  title: string;
  message: string;
  type: "loading" | "error" | "success";
  role?: "status" | "alert";
}) {
  const icon = type === "loading" ? "○" : type === "success" ? "✓" : "!";
  return <div className={`form-status form-status--${type}`} role={role} aria-live={role === "status" ? "polite" : undefined}><span aria-hidden="true">{icon}</span><div><h3>{title}</h3><p>{message}</p></div></div>;
}

export function Field({ label, name, type = "text", placeholder, help, required = false, children }: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  help?: string;
  required?: boolean;
  children?: ReactNode;
}) {
  const helpId = help ? `${name}-help` : undefined;
  return <FormFieldShell label={label} name={name} help={help} required={required}>{children ?? <input id={name} name={name} type={type} placeholder={placeholder} required={required} aria-describedby={helpId} />}</FormFieldShell>;
}

export function SelectField({ label, name, placeholder, options, required = false, help }: {
  label: string;
  name: string;
  placeholder: string;
  options: readonly string[];
  required?: boolean;
  help?: string;
}) {
  return <Field label={label} name={name} required={required} help={help}><select id={name} name={name} required={required} defaultValue=""><option value="" disabled>{placeholder}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></Field>;
}

export function TextAreaField({ label, name, placeholder, help }: { label: string; name: string; placeholder: string; help?: string }) {
  return <Field label={label} name={name} help={help}><textarea id={name} name={name} placeholder={placeholder} rows={6} aria-describedby={help ? `${name}-help` : undefined} /></Field>;
}

export function StaticForm({ kicker = "Inquiry Form", title, intro, children, acknowledgment, buttonLabel, privacy }: {
  kicker?: string;
  title: string;
  intro: string;
  children: ReactNode;
  acknowledgment: string;
  buttonLabel: string;
  privacy: string;
}) {
  return <section className="form-card" aria-labelledby="form-title"><p className="form-card__kicker">{kicker}</p><h2 id="form-title">{title}</h2><p className="lede">{intro}</p><form><div className="form-grid">{children}</div><label className="check-field"><input type="checkbox" required /><span>{acknowledgment}</span></label><button className="button button--primary" type="button" aria-describedby="integration-note">{buttonLabel}</button><p className="form-privacy">{privacy}</p><p id="integration-note" className="integration-note">Online submission will be enabled in a later integration phase.</p></form></section>;
}
