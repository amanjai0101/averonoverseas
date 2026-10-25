/**
 * Form validation utility for all contact/quote/enquiry forms
 * Handles: field validation, sanitization, error messaging
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Simple email regex (user@domain.com style)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name: alphanumeric, spaces, hyphens, apostrophes, accents
const nameRegex = /^[a-zA-Z\s\-'àáâäãåèéêëìíîïòóôöõùúûüçñ]+$/;

// Product/company: alphanumeric, spaces, common chars
const textRegex = /^[a-zA-Z0-9\s\-.,()]+$/;

// Sanitize text to prevent XSS (basic)
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000); // Cap at 1000 chars
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Validate individual fields
export function validateName(name: string): ValidationError | null {
  const trimmed = name.trim();
  if (!trimmed) return { field: 'name', message: 'Name is required' };
  if (trimmed.length < 2) return { field: 'name', message: 'Name must be at least 2 characters' };
  if (trimmed.length > 100) return { field: 'name', message: 'Name must be under 100 characters' };
  if (!nameRegex.test(trimmed)) {
    return { field: 'name', message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  return null;
}

export function validateEmail(email: string): ValidationError | null {
  const trimmed = sanitizeEmail(email);
  if (!trimmed) return { field: 'email', message: 'Email is required' };
  if (!emailRegex.test(trimmed)) return { field: 'email', message: 'Please enter a valid email address' };
  if (trimmed.length > 255) return { field: 'email', message: 'Email is too long' };
  return null;
}

export function validateProduct(product: string): ValidationError | null {
  const trimmed = product.trim();
  if (!trimmed) return { field: 'product', message: 'Product is required' };
  if (trimmed.length < 2) return { field: 'product', message: 'Product must be at least 2 characters' };
  if (trimmed.length > 200) return { field: 'product', message: 'Product description is too long' };
  return null;
}

export function validateSubject(subject: string): ValidationError | null {
  const trimmed = subject.trim();
  if (!trimmed) return { field: 'subject', message: 'Subject is required' };
  if (trimmed.length < 3) return { field: 'subject', message: 'Subject must be at least 3 characters' };
  if (trimmed.length > 100) return { field: 'subject', message: 'Subject must be under 100 characters' };
  return null;
}

export function validateMessage(message: string): ValidationError | null {
  const trimmed = message.trim();
  if (!trimmed) return { field: 'message', message: 'Message is required' };
  if (trimmed.length < 5) return { field: 'message', message: 'Message must be at least 5 characters' };
  if (trimmed.length > 1000) return { field: 'message', message: 'Message must be under 1000 characters' };
  return null;
}

export function validateConsent(checked: boolean): ValidationError | null {
  if (!checked) return { field: 'consent', message: 'You must agree to the privacy policy' };
  return null;
}

// Home form validation: name, email, product required
export function validateHomeQuoteForm(data: {
  name: string;
  email: string;
  product: string;
  quantity?: string;
  consent: boolean;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const nameErr = validateName(data.name);
  if (nameErr) errors.push(nameErr);

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.push(emailErr);

  const productErr = validateProduct(data.product);
  if (productErr) errors.push(productErr);

  const consentErr = validateConsent(data.consent);
  if (consentErr) errors.push(consentErr);

  return {
    valid: errors.length === 0,
    errors,
  };
}

// RFQ form validation: name, email, product, consent required
export function validateRfqForm(data: {
  name: string;
  email: string;
  product: string;
  consent: boolean;
  company?: string;
  country?: string;
  quantity?: string;
  grade?: string;
  notes?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const nameErr = validateName(data.name);
  if (nameErr) errors.push(nameErr);

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.push(emailErr);

  const productErr = validateProduct(data.product);
  if (productErr) errors.push(productErr);

  const consentErr = validateConsent(data.consent);
  if (consentErr) errors.push(consentErr);

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Contact form validation: name, email, subject, message, consent required
export function validateContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  consent: boolean;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const nameErr = validateName(data.name);
  if (nameErr) errors.push(nameErr);

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.push(emailErr);

  const subjectErr = validateSubject(data.subject);
  if (subjectErr) errors.push(subjectErr);

  const messageErr = validateMessage(data.message);
  if (messageErr) errors.push(messageErr);

  const consentErr = validateConsent(data.consent);
  if (consentErr) errors.push(consentErr);

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Get error message for a specific field (for inline display)
export function getFieldError(errors: ValidationError[], fieldName: string): string {
  const err = errors.find(e => e.field === fieldName);
  return err ? err.message : '';
}

// Build summary message for all errors (for toast/alert)
export function buildErrorSummary(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  const fieldNames = [...new Set(errors.map(e => e.field))];
  const count = fieldNames.length;
  return `Please fill all required fields (${count} issue${count !== 1 ? 's' : ''})`;
}
