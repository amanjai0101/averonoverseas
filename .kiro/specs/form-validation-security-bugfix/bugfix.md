# Bugfix Requirements: Form Validation and Security

## Introduction

Averon Overseas forms (Contact at `/contact/`, RFQ at `/rfq/`, and Home Enquiry on `/`) have critical validation and security gaps that degrade user experience and create security risks:
- Forms submit even with missing mandatory fields (name, email, consent)
- No email format validation or field-level security patterns
- Privacy consent is not properly enforced
- Users receive generic error messages with no field-specific guidance
- Honeypot anti-spam field exists but is never checked
- Form inputs are not sanitized before submission, creating XSS/injection risk
- Success/error messaging is inconsistent across forms

This bugfix addresses all three forms simultaneously, implementing comprehensive client-side validation, security hardening, and consistent user feedback.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user submits a form with an empty required field (name, email, or message/notes) THEN the system processes the submission without validation, sending incomplete data to Web3Forms

1.2 WHEN a user enters an invalid email format (e.g., "user@" or "no-domain") THEN the system accepts the value and submits it without validation

1.3 WHEN a user submits a form WITHOUT checking the privacy consent checkbox THEN the system processes the submission without enforcing consent, violating GDPR/privacy requirements

1.4 WHEN a user fills the honeypot field (intended for spam-bots) THEN the system submits the form normally instead of rejecting it

1.5 WHEN a user submits a form with HTML/script content (e.g., `<script>alert('xss')</script>`) THEN the system sends unescaped values to the backend without sanitization

1.6 WHEN a form submission fails THEN the system displays generic error messages (e.g., "Something went wrong") instead of field-specific guidance

1.7 WHEN success/error messages are shown across different forms THEN the messaging is inconsistent in wording, tone, and visual styling

1.8 WHEN a user submits a form and immediately clicks submit again THEN the system allows duplicate submissions without a loading/disabled state on the button

### Expected Behavior (Correct)

2.1 WHEN a user attempts to submit a form with an empty required field THEN the system SHALL prevent submission, display an inline error message next to the field, and focus the first invalid field

2.2 WHEN a user enters an invalid email format THEN the system SHALL validate the format in real-time, display an error message (e.g., "Please enter a valid email address"), and prevent submission

2.3 WHEN a user attempts to submit a form WITHOUT checking the privacy consent checkbox THEN the system SHALL prevent submission and display an error message (e.g., "You must agree to the privacy policy to continue")

2.4 WHEN a honeypot field is populated (detected as spam) THEN the system SHALL silently prevent submission without revealing the validation method to the attacker

2.5 WHEN a form is submitted with HTML/script content THEN the system SHALL sanitize the values (escape HTML, remove scripts) before transmission to the backend

2.6 WHEN a form submission fails (network error or backend rejection) THEN the system SHALL display a clear error message describing the problem and suggesting corrective action (e.g., "Could not send. Please try again or email us directly.")

2.7 WHEN success/error messages are shown across all three forms THEN the system SHALL use consistent messaging in tone, wording, visual styling, and duration across Contact, RFQ, and Home Enquiry forms

2.8 WHEN a user submits a form THEN the system SHALL set a loading state on the submit button (disabled, loading text), preventing double-submission until the request completes or fails

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user submits a valid Contact form with all required fields completed and consent checked THEN the system SHALL CONTINUE TO send the submission to Web3Forms and display a success message without breaking existing Web3Forms integration

3.2 WHEN a user submits a valid RFQ form with all required fields completed and consent checked THEN the system SHALL CONTINUE TO send the submission to Web3Forms, pre-fill URL parameters correctly, and maintain the product datalist functionality

3.3 WHEN a user submits the Home Enquiry form with all required fields completed and consent checked THEN the system SHALL CONTINUE TO send the submission to Web3Forms and integrate with the home page without disruption

3.4 WHEN a user focuses on a form field THEN the system SHALL CONTINUE TO show visible focus states for keyboard accessibility

3.5 WHEN a user submits a valid form THEN the system SHALL CONTINUE TO reset all fields to empty state after successful submission (preserving existing UX pattern)

3.6 WHEN a user loads a page with a form THEN the system SHALL CONTINUE TO preserve all existing accessibility features (ARIA labels, semantic HTML, skip links)

3.7 WHEN the user navigates away from a form after submission THEN the system SHALL CONTINUE TO work with the existing page navigation without introducing new dependencies or build steps
