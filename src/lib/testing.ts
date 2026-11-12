/**
 * The Testing > Form page's own data access — kept separate from
 * `src/lib/api.ts` (the community's public API) because this talks to the
 * Site Database instead, a different system with different rules.
 */
import {createServerFn} from '@tanstack/react-start';

import {getDb} from './db';

export interface FormSubmissionInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export type SubmitFormResult =
  | {ok: true}
  | {ok: false; error: string; fieldErrors?: Partial<Record<keyof FormSubmissionInput, string>>};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(input: FormSubmissionInput) {
  const fieldErrors: Partial<Record<keyof FormSubmissionInput, string>> = {};
  const name = input.name.trim();
  const email = input.email.trim();

  if (!name) {
    fieldErrors.name = 'Enter your name.';
  } else if (name.length > 120) {
    fieldErrors.name = 'Keep it under 120 characters.';
  }

  if (!email) {
    fieldErrors.email = 'Enter your email.';
  } else if (!EMAIL_RE.test(email) || email.length > 254) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (input.phone && input.phone.length > 32) {
    fieldErrors.phone = 'Keep it under 32 characters.';
  }
  if (input.message && input.message.length > 2000) {
    fieldErrors.message = 'Keep it under 2000 characters.';
  }

  return {fieldErrors, name, email};
}

/** Saves a basic-info submission from the Testing > Form page. */
export const submitTestingForm = createServerFn({method: 'POST'})
  .validator((input: FormSubmissionInput) => input)
  .handler(async ({data}): Promise<SubmitFormResult> => {
    const {fieldErrors, name, email} = validate(data);
    if (Object.keys(fieldErrors).length > 0) {
      return {ok: false, error: 'Please fix the highlighted fields.', fieldErrors};
    }

    const phone = data.phone?.trim() || null;
    const message = data.message?.trim() || null;

    try {
      const db = getDb();
      await db.formSubmission.create({data: {name, email, phone, message}});
      return {ok: true};
    } catch (err) {
      console.error('submitTestingForm failed:', err);
      return {ok: false, error: 'Something went wrong saving your submission. Please try again.'};
    }
  });
