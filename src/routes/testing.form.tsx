import {createFileRoute} from '@tanstack/react-router';
import {useState} from 'react';

import {pageTitle} from '../lib/title';
import {submitTestingForm, type FormSubmissionInput} from '../lib/testing';
import {useSite} from './__root';

export const Route = createFileRoute('/testing/form')({
  head: ({matches}) => ({meta: [{title: pageTitle(matches, 'Form')}]}),
  component: TestingForm,
});

type FieldErrors = Partial<Record<keyof FormSubmissionInput, string>>;

function TestingForm() {
  const site = useSite();
  const [values, setValues] = useState<FormSubmissionInput>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  function setField<K extends keyof FormSubmissionInput>(key: K, value: string) {
    setValues(v => ({...v, [key]: value}));
    setFieldErrors(fe => (fe[key] ? {...fe, [key]: undefined} : fe));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setFormError(null);
    setFieldErrors({});

    const result = await submitTestingForm({data: values});

    if (result.ok) {
      setStatus('done');
      setValues({name: '', email: '', phone: '', message: ''});
      return;
    }

    setStatus('error');
    setFormError(result.error);
    setFieldErrors(result.fieldErrors ?? {});
  }

  return (
    <main className="wrap narrow section">
      <p className="eyebrow">{site?.name ?? 'Community'} · Testing</p>
      <h1>Form</h1>
      <p className="lede">
        A quick form to collect a visitor's basic information — name, email, and an
        optional note.
      </p>

      {status === 'done' ? (
        <div className="form-card form-success" role="status">
          <h2>Thanks — you're all set.</h2>
          <p className="muted">Your submission has been saved.</p>
          <button type="button" className="button ghost" onClick={() => setStatus('idle')}>
            Submit another response
          </button>
        </div>
      ) : (
        <form className="form-card" onSubmit={onSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="name">
              Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={e => setField('name', e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              disabled={status === 'submitting'}
            />
            {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={e => setField('email', e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              disabled={status === 'submitting'}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={e => setField('phone', e.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
              disabled={status === 'submitting'}
            />
            {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="message">Message (optional)</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={values.message}
              onChange={e => setField('message', e.target.value)}
              aria-invalid={Boolean(fieldErrors.message)}
              disabled={status === 'submitting'}
            />
            {fieldErrors.message && <p className="field-error">{fieldErrors.message}</p>}
          </div>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button type="submit" className="button" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      )}
    </main>
  );
}
