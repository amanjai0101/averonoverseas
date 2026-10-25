# Form Validation and Security — Bugfix Design

## Overview

This design formalizes the comprehensive client-side form validation, security hardening, and consistent messaging solution for three contact forms on Averon Overseas (Contact, RFQ, and Home Enquiry). The fix implements mandatory field validation, email format checking, honeypot detection, privacy consent enforcement, input sanitization to prevent XSS, consistent error messaging, loading states, and accessibility improvements across all three forms.

The approach is minimal—no external libraries, native JavaScript only, using inline `<script>` tags in existing Astro components. All validation happens before submission to Web3Forms; sanitization occurs after validation but before transmission to the backend.

---

## Glossary

- **Bug_Condition (C)**: A form submission with one or more of the following conditions:
  - Missing required fields (name, email, message/notes, consent)
  - Invalid email format (e.g., "user@" or "no-domain")
  - Privacy consent checkbox unchecked
  - Honeypot field populated (spam-bot indicator)
  - HTML/script content in text inputs (XSS payload)

- **Property (P)**: The desired behavior when bug condition holds:
  - Form submission is prevented
  - Inline field-level errors are displayed
  - First invalid field receives focus
  - Error messages are clear and actionable

- **Preservation**: Existing behaviors that must remain unchanged:
  - Valid form submissions to Web3Forms still work
  - Form reset after successful submission
  - Web3Forms integration (access key, subject, honeypot field)
  - Existing accessibility features (ARIA labels, semantic HTML)
  - Visual design and token usage (colors, spacing, fonts)

- **handleFormSubmit**: The form submission handler function in `<script>` tag that validates, sanitizes, and submits
- **isBugCondition**: Pseudocode function that returns true if input contains any bug-triggering condition
- **expectedBehavior**: Pseudocode function that verifies correct behavior after fix
- **sanitize**: Function that HTML-escapes text inputs to prevent XSS injection
- **fieldErrors**: Object mapping field names to error messages

---

## Bug Details

### Bug Condition

The bug manifests when a user submits a form (Contact, RFQ, or Home Enquiry) with any of the following conditions:
- One or more required fields (name, email, message/notes/product, consent) are empty
- Email field contains an invalid format (missing domain, missing @ symbol, etc.)
- Privacy consent checkbox is unchecked
- Honeypot field is populated (spam-bot detection)
- Text inputs contain HTML/script content without escaping

The `handleFormSubmit` function either does not validate these conditions or does not prevent submission when they are detected.

**Formal Specification:**

```
FUNCTION isBugCondition(formData)
  INPUT: formData as FormData object from HTML form
  OUTPUT: boolean
  
  RETURN (
    isEmpty(formData.get("name"))
    OR isEmpty(formData.get("email"))
    OR NOT isValidEmail(formData.get("email"))
    OR isEmpty(formData.get("message") || formData.get("product") || formData.get("notes"))
    OR NOT isChecked(formData.get("consent"))
    OR NOT isEmpty(formData.get("_honey"))
    OR containsHtmlOrScript(formData)
  )
END FUNCTION
```

**Helper Functions:**

```
FUNCTION isEmpty(value)
  RETURN value === null OR value === "" OR value.trim() === ""
END FUNCTION

FUNCTION isValidEmail(email)
  PATTERN: /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  RETURN email.match(PATTERN) IS NOT null
END FUNCTION

FUNCTION isChecked(checkbox)
  RETURN checkbox === "on" OR checkbox === true
END FUNCTION

FUNCTION containsHtmlOrScript(formData)
  FOR EACH field IN formData.keys() DO
    value := formData.get(field)
    IF value.includes("<") OR value.includes(">") OR value.includes("script") THEN
      RETURN true
    END IF
  END FOR
  RETURN false
END FUNCTION
```

### Examples

**Example 1: Missing Required Field (Name)**
- User submits Contact form with name field empty
- Current behavior: Form submits to Web3Forms with incomplete data
- Expected behavior: Error message "Name is required" displayed below name field; submission prevented; focus moves to name field
- Validates: Requirements 2.1, 1.1

**Example 2: Invalid Email Format**
- User enters "john.doe@" or "nodomain" in email field
- Current behavior: Form accepts invalid email and submits
- Expected behavior: Error message "Please enter a valid email address" displayed; submission prevented
- Validates: Requirements 2.2, 1.2

**Example 3: Unchecked Privacy Consent**
- User submits RFQ form without checking privacy consent checkbox
- Current behavior: Form submits without enforcing consent
- Expected behavior: Error message "You must agree to the privacy policy to continue" displayed; submission prevented
- Validates: Requirements 2.3, 1.3

**Example 4: Honeypot Populated (Spam Detection)**
- Bot automatically fills the hidden `_honey` field
- Current behavior: Form submits normally
- Expected behavior: Submission is silently rejected (no error message shown, form just does nothing)
- Validates: Requirements 2.4, 1.4

**Example 5: XSS Payload in Text Input**
- User (or attacker) enters `<script>alert('xss')</script>` in message/notes field
- Current behavior: Unescaped value sent to Web3Forms backend
- Expected behavior: Value is sanitized to HTML entities before transmission: `&lt;script&gt;alert('xss')&lt;/script&gt;`
- Validates: Requirements 2.5, 1.5

**Example 6: Double-Submit Prevention**
- User submits form and immediately clicks submit button again
- Current behavior: Multiple submissions sent to Web3Forms
- Expected behavior: Submit button is disabled with "Sending…" state; cannot be clicked until request completes or fails
- Validates: Requirements 2.8, 1.8

**Example 7: Generic Error Message (Regression)**
- Form submission fails due to network error
- Current behavior: Generic message "Something went wrong"
- Expected behavior: Clear message with action: "Could not send. Please try again or email us directly."
- Validates: Requirements 2.6, 1.6

**Example 8: Valid Form Submission (Preservation)**
- User submits Contact form with all required fields valid and consent checked
- Current behavior: Form submits to Web3Forms
- Expected behavior: Form still submits to Web3Forms, displays success message, resets fields (no regression)
- Validates: Requirements 3.1, 3.2, 3.3

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Valid form submissions must continue to be sent to Web3Forms with the correct access key, subject, and field names
- Form reset after successful submission must work exactly as before
- Web3Forms integration (request method, endpoint URL) must remain unchanged
- Existing accessibility features (ARIA labels, semantic HTML, focus management) must be preserved
- Visual design tokens and colors must remain unchanged
- Navigation and page structure must not be affected
- URL parameter pre-fill (e.g., `?product=`) must continue to work on RFQ form
- Product datalist on RFQ form must continue to autocomplete
- Existing error/success message styling and colors must remain consistent

**Scope:**
All inputs that do NOT involve validation errors (valid required fields, valid email, checked consent, empty honeypot) should be completely unaffected by this fix. This includes:
- Valid form submissions with all required data
- User interactions with other form fields and buttons
- Page load and rendering
- Existing JavaScript functionality (URL param pre-fill on RFQ)

---

## Hypothesized Root Cause

Based on the bugfix requirements, the most likely issues are:

1. **No Client-Side Validation**: The current form submission handlers immediately send data to Web3Forms without checking if required fields are empty or properly formatted. The `<script>` tags contain only submission logic, not validation logic.

2. **No Email Format Validation**: Email fields are submitted with the `type="email"` attribute, which provides browser-level validation but no client-side JavaScript validation. The current submit handler does not check email format before transmission.

3. **No Honeypot Checking**: The hidden `_honey` field exists in all forms but is never checked before submission. Spam-bots that fill this field are never detected or blocked.

4. **No Consent Enforcement**: The privacy consent checkbox has `required` attribute (HTML5 validation) but no JavaScript validation. The form handler does not explicitly verify that consent is checked before submission.

5. **No Input Sanitization**: Text inputs (message, notes, product) are directly passed to Web3Forms without HTML entity encoding. Any user input containing `<`, `>`, or script-like content is sent as-is, creating XSS vulnerability.

6. **No Field-Level Error Display**: The current error display (`form-msg` element) shows a single generic message for the entire form. There is no field-level error indication, styling, or association with specific fields using `aria-invalid` and `aria-describedby`.

7. **No Loading State on Button**: The submit button has no disabled state or loading text during submission. Users can click it multiple times, causing duplicate submissions.

8. **No First-Field Focus**: When validation fails, the form does not move focus to the first invalid field, making it harder for keyboard users and screen readers to identify the problem.

9. **Inconsistent Messaging**: Error and success messages vary in wording and tone across the three forms. Success messages use different text ("Message sent" vs. "Thank you — we will be in touch shortly").

---

## Correctness Properties

Property 1: Bug Condition - Form Validation Prevents Invalid Submissions

_For any_ form submission where the bug condition holds (isBugCondition returns true), the fixed form handler SHALL prevent submission to Web3Forms, display inline field-level error messages, set `aria-invalid="true"` on invalid fields, and focus the first invalid field. The user SHALL see clear, actionable error guidance for each invalid field.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8**

Property 2: Preservation - Valid Submissions and Existing Behavior

_For any_ form submission where the bug condition does NOT hold (isBugCondition returns false), the fixed form handler SHALL produce exactly the same behavior as the original code, including Web3Forms submission, success message display, form reset, and all existing accessibility features. No regression in valid submission flow.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

---

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**Files Modified:**
1. `src/pages/contact.astro` — replace form submission handler
2. `src/pages/rfq.astro` — replace form submission handler
3. `src/pages/index.astro` — replace home enquiry form submission handler
4. Optional: `src/utilities/formValidation.ts` — create shared validation utilities (if centralization is desired; initial implementation keeps validation inline in each `<script>` tag)

**Implementation Pattern for Each Form:**

The following implementation applies to all three forms (Contact, RFQ, Home Enquiry) with minor field name adjustments.

### 1. Shared Validation Utilities (Inline or Extracted)

Create validation functions (either inline in each `<script>` tag or in a shared utility module):

```javascript
// Validation Rules
const VALIDATION_RULES = {
  name: {
    required: true,
    error: "Name is required"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    error: "Please enter a valid email address"
  },
  message: { // for Contact form
    required: true,
    error: "Message is required"
  },
  product: { // for RFQ and Home Enquiry
    required: true,
    error: "Product is required"
  },
  notes: { // for RFQ
    required: false,
    error: null
  },
  consent: {
    required: true,
    error: "You must agree to the privacy policy to continue"
  }
};

// Validation Functions
function validateField(fieldName, fieldValue) {
  const rules = VALIDATION_RULES[fieldName];
  if (!rules) return null; // No validation rule for this field

  fieldValue = (fieldValue || "").trim();

  if (rules.required && !fieldValue) {
    return rules.error;
  }

  if (rules.pattern && fieldValue && !rules.pattern.test(fieldValue)) {
    return rules.error;
  }

  return null; // Valid
}

function validateForm(formElement) {
  const fieldErrors = {};
  const formData = new FormData(formElement);
  
  for (const [fieldName] of formData) {
    const fieldValue = formData.get(fieldName);
    const error = validateField(fieldName, fieldValue);
    if (error) {
      fieldErrors[fieldName] = error;
    }
  }
  
  return fieldErrors;
}

// Honeypot Detection
function isHoneypotFilled(formElement) {
  const honeypot = formElement.querySelector('input[name="_honey"]') as HTMLInputElement;
  return honeypot && honeypot.value !== "";
}

// Input Sanitization
function sanitizeInput(value) {
  const textarea = document.createElement("textarea");
  textarea.textContent = value;
  return textarea.innerHTML;
}

function sanitizeFormData(formData) {
  const sanitized = new FormData();
  for (const [key, value] of formData) {
    if (key === "_honey" || key === "access_key" || key === "subject") {
      // Don't sanitize special fields
      sanitized.append(key, value);
    } else if (typeof value === "string") {
      sanitized.append(key, sanitizeInput(value));
    } else {
      sanitized.append(key, value);
    }
  }
  return sanitized;
}
```

### 2. Form Submission Handler (Per Form)

Replace the existing form submission handler with comprehensive validation, error display, and sanitization:

```javascript
// Contact Form Example
const form = document.getElementById('contact-form') as HTMLFormElement;
const msgContainer = document.getElementById('cf-msg') as HTMLElement;
const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;

if (form && msgContainer) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearFieldErrors(form);
    msgContainer.textContent = '';
    msgContainer.className = 'form-msg';
    
    // Honeypot check (silent rejection)
    if (isHoneypotFilled(form)) {
      return; // Do nothing, do not show error
    }
    
    // Validate all fields
    const fieldErrors = validateForm(form);
    
    // If validation fails, show errors and exit
    if (Object.keys(fieldErrors).length > 0) {
      displayFieldErrors(form, fieldErrors, msgContainer);
      focusFirstInvalidField(form, fieldErrors);
      return; // Do NOT submit
    }
    
    // All valid: sanitize, set loading state, submit
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    msgContainer.textContent = 'Sending…';
    msgContainer.className = 'form-msg';
    
    try {
      let formData = new FormData(form);
      formData = sanitizeFormData(formData);
      
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        msgContainer.textContent = 'Message sent. We will be in touch shortly.';
        msgContainer.className = 'form-msg form-msg--ok';
        form.reset();
      } else {
        msgContainer.textContent = 'Could not send. Please try again or email us directly.';
        msgContainer.className = 'form-msg form-msg--err';
        submitButton.disabled = false;
        submitButton.textContent = 'Send message';
      }
    } catch (error) {
      msgContainer.textContent = 'Could not send. Please email info@averonoverseas.com.';
      msgContainer.className = 'form-msg form-msg--err';
      submitButton.disabled = false;
      submitButton.textContent = 'Send message';
    }
  });
}
```

### 3. Field Error Display Functions

Add these helper functions to display errors inline at the field level:

```javascript
function displayFieldErrors(form, fieldErrors, msgContainer) {
  for (const [fieldName, errorMessage] of Object.entries(fieldErrors)) {
    const field = form.querySelector(`input[name="${fieldName}"], textarea[name="${fieldName}"]`) as HTMLElement;
    if (field) {
      const fieldWrapper = field.closest('.form-field') || field.parentElement;
      
      // Mark field as invalid
      field.setAttribute('aria-invalid', 'true');
      
      // Create and display error message
      const errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      errorEl.setAttribute('role', 'alert');
      errorEl.textContent = errorMessage;
      errorEl.id = `error-${fieldName}`;
      
      field.setAttribute('aria-describedby', `error-${fieldName}`);
      
      if (fieldWrapper) {
        fieldWrapper.appendChild(errorEl);
      } else {
        field.parentElement?.appendChild(errorEl);
      }
    }
  }
  
  // Display summary message
  msgContainer.textContent = 'Please correct the errors below.';
  msgContainer.className = 'form-msg form-msg--err';
}

function clearFieldErrors(form) {
  form.querySelectorAll('[aria-invalid]').forEach(field => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  });
  form.querySelectorAll('.field-error').forEach(el => el.remove());
}

function focusFirstInvalidField(form, fieldErrors) {
  const firstInvalidFieldName = Object.keys(fieldErrors)[0];
  if (firstInvalidFieldName) {
    const field = form.querySelector(`input[name="${firstInvalidFieldName}"], textarea[name="${firstInvalidFieldName}"]`) as HTMLElement;
    if (field) {
      field.focus();
    }
  }
}
```

### 4. CSS for Field-Level Errors

Add these styles to the form section to display field errors visually:

```css
.form-field {
  position: relative;
  display: flex;
  flex-direction: column;
}

.form-field input,
.form-field textarea {
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input[aria-invalid="true"],
.form-field textarea[aria-invalid="true"] {
  border-color: #8b1a1a;
  box-shadow: inset 0 0 0 1px #8b1a1a;
}

.field-error {
  font-size: 0.8125rem;
  color: #8b1a1a;
  margin-top: 0.25rem;
  font-weight: 500;
}

.form-msg--err {
  color: #8b1a1a;
  font-weight: 500;
}

.form-msg--ok {
  color: #1a6632;
  font-weight: 500;
}

/* Loading state */
button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 5. Form Field Adjustments

Ensure all form fields are properly wrapped and labeled:

```html
<!-- Example from Contact form -->
<div class="form-field">
  <label for="cf-name">Name</label>
  <input id="cf-name" name="name" type="text" autocomplete="name" required />
</div>

<div class="form-field">
  <label for="cf-email">Email</label>
  <input id="cf-email" name="email" type="email" autocomplete="email" required />
</div>

<div class="form-field">
  <label for="cf-message">Message</label>
  <textarea id="cf-message" name="message" rows="5" required></textarea>
</div>

<!-- Consent checkbox -->
<label class="checkbox-row">
  <input type="checkbox" name="consent" required />
  <span>I agree to Averon Overseas processing my details to respond to this message. <a href="/privacy/">Privacy Policy</a>.</span>
</label>

<!-- Error message container -->
<div id="cf-msg" class="form-msg" aria-live="polite" role="status"></div>

<!-- Submit button -->
<button type="submit" class="btn btn-primary btn-block">Send message</button>
```

### 6. Consistency Across All Three Forms

**Contact Form (`contact.astro`):**
- Required fields: name, email, message, consent
- Button text: "Send message"
- Success message: "Message sent. We will be in touch shortly."

**RFQ Form (`rfq.astro`):**
- Required fields: name, email, product, consent
- Button text: "Send quote request"
- Success message: "Thank you — we will be in touch shortly."
- Special: Preserve URL param pre-fill for product field

**Home Enquiry Form (in `index.astro`):**
- Required fields: name, email, product, consent
- Button text: "Send enquiry"
- Success message: "Thank you — we will be in touch shortly."

**Consistent Across All:**
- Error color: `#8b1a1a`
- Success color: `#1a6632`
- CSS class naming: `.form-msg`, `.form-msg--ok`, `.form-msg--err`, `.field-error`
- Validation rules: same email pattern, same required field logic
- Honeypot handling: silent rejection (no error shown)
- Sanitization: HTML entity encoding applied to all text inputs

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code; second, verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate form submissions with missing fields, invalid emails, unchecked consent, honeypot filled, and XSS payloads. Run these tests on the UNFIXED code to observe failures (submissions going through without validation) and understand the root cause.

**Test Cases**:

1. **Missing Name Test** (will fail on unfixed code): Simulate Contact form submission with empty name field. Assert that form-msg shows error and submission is prevented.
   - Current behavior: Form submits to Web3Forms with empty name
   - After fix: Error displayed, submission prevented

2. **Invalid Email Test** (will fail on unfixed code): Simulate email submission with "invalid@" or "nodomain". Assert that form-msg shows email error.
   - Current behavior: Invalid email accepted and submitted
   - After fix: Error displayed, submission prevented

3. **Unchecked Consent Test** (will fail on unfixed code): Simulate form submission without checking privacy consent. Assert error message.
   - Current behavior: Form submits without enforcing consent
   - After fix: Error displayed, submission prevented

4. **Honeypot Filled Test** (will fail on unfixed code): Simulate bot filling `_honey` field. Assert that submission is silently rejected.
   - Current behavior: Form submits normally
   - After fix: Submission silently rejected, no error shown

5. **XSS Payload Test** (will fail on unfixed code): Enter `<script>alert('xss')</script>` in message. Inspect network request to Web3Forms. Assert payload is escaped.
   - Current behavior: Unescaped `<script>` sent
   - After fix: Escaped `&lt;script&gt;` sent

6. **Double-Submit Test** (will fail on unfixed code): Click submit, then immediately click again. Assert button becomes disabled and only one request is sent.
   - Current behavior: Multiple requests sent
   - After fix: Button disabled, only one request sent

7. **Missing Message Test** (RFQ): Submit RFQ with empty product field. Assert error displayed.
   - Current behavior: Submits with empty product
   - After fix: Error "Product is required" displayed

**Expected Counterexamples**:
- Form data submitted to Web3Forms without validation
- No field-level error messages displayed
- No focus management to first invalid field
- Missing required fields accepted in submissions
- XSS payloads not escaped before transmission
- Multiple duplicate submissions possible

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  simulate form submission with input
  result := handleFormSubmit(input)
  ASSERT NOT result.submitted  // Should not be sent to Web3Forms
  ASSERT result.errors.length > 0  // Should have field errors
  ASSERT result.focusedField === firstInvalidField  // Should focus first error
  ASSERT result.msgContainer.contains("error message")  // Should display error
END FOR
```

**Test Implementation:**
- Unit tests for each validation rule (validateField function)
- Unit tests for sanitizeInput function
- Integration tests simulating form submission events
- Tests verify error display, aria-invalid setting, and focus management

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT handleFormSubmit_original(input) = handleFormSubmit_fixed(input)
  // i.e., valid submissions should work identically
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (various valid form data combinations)
- It catches edge cases (e.g., valid email formats with unusual characters, various consent checkbox states)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: 
- Observe behavior on UNFIXED code for valid form submissions (all fields filled, valid email, consent checked, honeypot empty)
- Record Web3Forms request (method, endpoint, body content)
- Write property-based tests generating random valid form data
- For each generated valid input, verify: (1) submission succeeds to Web3Forms, (2) success message shown, (3) form resets, (4) button returns to normal state

**Test Cases**:

1. **Valid Submission Preservation** (Contact): Generate random name, valid email, and message. Verify submission to Web3Forms succeeds and returns success state.
   - Assert: res.ok returns true, form resets, button text returns to "Send message"

2. **Valid Email Formats**: Generate various valid email formats (firstname@domain.co.uk, user+tag@example.org, etc.). Verify all pass validation.
   - Assert: No validation error for format variations

3. **Form Reset After Success**: Submit valid form, verify form fields clear, button state resets, message container clears.
   - Assert: form.elements are empty after success

4. **Web3Forms Integration Preservation**: Verify submit requests to Web3Forms include access_key, subject, and form data fields.
   - Assert: fetch called with correct endpoint, method POST, FormData body

5. **Consent Checkbox Preservation**: Verify that when consent IS checked, submission proceeds (no error for consent).
   - Assert: No error in fieldErrors for "consent"

6. **Non-Honeypot Submissions**: Generate many form submissions with honeypot EMPTY. Verify all proceed to Web3Forms (not silently rejected).
   - Assert: fetch is called for each submission

7. **Keyboard Accessibility Preservation**: Verify focus states and ARIA labels remain after fix.
   - Assert: form fields have proper labels, focus visible on inputs

8. **URL Param Pre-Fill Preservation (RFQ)**: Load RFQ with ?product=CRC and verify product field pre-fills correctly.
   - Assert: rf-product.value === "CRC"

### Unit Tests

- Test `validateField('name', '')` returns "Name is required"
- Test `validateField('name', 'John')` returns null (valid)
- Test `validateField('email', 'invalid@')` returns "Please enter a valid email address"
- Test `validateField('email', 'user@example.com')` returns null (valid)
- Test `validateField('consent', false)` returns "You must agree to the privacy policy to continue"
- Test `sanitizeInput('<script>alert(1)</script>')` returns `&lt;script&gt;alert(1)&lt;/script&gt;`
- Test `sanitizeInput('hello world')` returns "hello world" (no change)
- Test `isHoneypotFilled(form)` with empty _honey field returns false
- Test `isHoneypotFilled(form)` with filled _honey field returns true
- Test `clearFieldErrors(form)` removes all `.field-error` elements and `aria-invalid` attributes

### Property-Based Tests

- **Property**: For any valid form data (all required fields filled, valid email format, consent checked, empty honeypot), `handleFormSubmit` SHALL submit to Web3Forms and display success message without errors.
- **Property**: For any email matching the pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, `validateField('email', email)` SHALL return null (valid).
- **Property**: For any string containing HTML special characters (`<`, `>`, `&`), `sanitizeInput(string)` SHALL escape those characters and NOT contain unescaped HTML tags.
- **Property**: For any form with `_honey` field empty, `handleFormSubmit` SHALL NOT silently reject the submission (should proceed to validation).
- **Property**: For any form with `_honey` field filled, `handleFormSubmit` SHALL silently reject (return early without showing error or submitting).

### Integration Tests

- **Test 1**: Navigate to Contact form, fill all fields with valid data, submit, verify success message displayed and form resets
- **Test 2**: Navigate to RFQ form with `?product=CRC`, verify product field pre-fills, complete other fields, submit, verify success
- **Test 3**: Load Home Enquiry form, submit with empty name, verify error displayed and focus moved to name field
- **Test 4**: Load Contact form, enter XSS payload in message, intercept Web3Forms request, verify payload is escaped
- **Test 5**: Submit Contact form, immediately click submit again, verify button disabled and only one request sent to Web3Forms
- **Test 6**: Fill Contact form with all fields valid, close/reload page before success message clears, verify message clears on reload
- **Test 7**: Test keyboard-only navigation: Tab through form fields, verify visible focus states, press Enter to submit, verify submission works
- **Test 8**: Test screen reader announcements: Use ARIA attributes, verify error messages announced with `role="alert"`, verify field validity announced with `aria-invalid`

---

## Summary

This design provides a comprehensive, minimal, native-JavaScript approach to form validation and security across three forms. The implementation:

1. **Validates all required fields** (name, email, message/notes/product, consent) before submission
2. **Validates email format** with a simple regex pattern
3. **Enforces privacy consent** with explicit checkbox validation
4. **Detects honeypot spam** and silently rejects spam-bot submissions
5. **Sanitizes inputs** with HTML entity encoding to prevent XSS
6. **Displays field-level errors** with clear messaging and visual indication
7. **Focuses first invalid field** for accessibility
8. **Disables submit button** during submission to prevent double-submit
9. **Uses consistent messaging** across all three forms
10. **Preserves all existing behavior** for valid submissions
11. **Maintains accessibility** with ARIA labels and semantic HTML
12. **Uses design tokens** for color and styling consistency

The testing strategy verifies bug fixes through exploratory checking, validates correctness properties through unit and property-based tests, and ensures preservation of existing behavior through integration tests.
