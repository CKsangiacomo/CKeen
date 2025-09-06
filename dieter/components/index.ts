// Dieter Component Contracts v0
// Tokens-only design system. Props are minimal, accessible, theme-safe.

export type Size = 'sm' | 'md' | 'lg';
export type State = 'default' | 'error' | 'success' | 'warning';
export type Theme = 'light' | 'dark' | 'hc';

// Button
export interface DieterButtonProps {
  size?: Size;              // default md
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// Input
export interface DieterInputProps {
  size?: Size;              // default md
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  state?: State;
  type?: 'text' | 'email' | 'password';
}

// Textarea
export interface DieterTextareaProps {
  size?: Size;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  state?: State;
  rows?: number;            // default 3
}

// Select
export interface DieterSelectProps {
  size?: Size;
  disabled?: boolean;
  required?: boolean;
  state?: State;
}

// Choice (Checkbox/Radio)
export interface DieterChoiceProps {
  size?: Size;
  disabled?: boolean;
  required?: boolean;
  state?: State;
  type: 'checkbox' | 'radio';
  name: string;
  value: string;
  checked?: boolean;
}

// Form Group
export interface DieterFormGroupProps {
  required?: boolean;
  orientation?: 'row' | 'column';
  helpText?: string;
  errorText?: string;
}

// Validation Summary
export interface DieterValidationSummaryProps {
  state: 'error' | 'success' | 'warning';
  message: string;
  role?: 'alert' | 'status';
}

// Barrel exports (contracts only)
export type {
  DieterButtonProps,
  DieterInputProps,
  DieterTextareaProps,
  DieterSelectProps,
  DieterChoiceProps,
  DieterFormGroupProps,
  DieterValidationSummaryProps
};


