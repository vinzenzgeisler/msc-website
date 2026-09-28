import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RacePicApiError } from './client';
import { isPasskeyRequired, payoutsErrorMessage, runWithStrongStepUp, type StepUpSteps } from './payoutsFlow';

const stepUpRequired = () => new RacePicApiError(403, 'STEP_UP_REQUIRED');

const makeSteps = (overrides: Partial<StepUpSteps> = {}) => {
  const calls: string[] = [];
  const steps: StepUpSteps = {
    fetchOptions: async () => { calls.push('options'); return { challenge: 'c' }; },
    authenticate: async (options) => { calls.push(`authenticate:${(options as { challenge: string }).challenge}`); return { id: 'cred' }; },
    verify: async (assertion) => { calls.push(`verify:${(assertion as { id: string }).id}`); return {}; },
    ...overrides
  };
  return { steps, calls };
};

describe('runWithStrongStepUp', () => {
  it('runs the action once when no step-up is required', async () => {
    const { steps, calls } = makeSteps();
    const action = vi.fn().mockResolvedValue('link');
    await expect(runWithStrongStepUp(action, steps)).resolves.toBe('link');
    expect(action).toHaveBeenCalledTimes(1);
    expect(calls).toEqual([]);
  });

  it('asks for the passkey once and retries the action exactly once', async () => {
    const { steps, calls } = makeSteps();
    const action = vi.fn().mockRejectedValueOnce(stepUpRequired()).mockResolvedValueOnce('link');
    await expect(runWithStrongStepUp(action, steps)).resolves.toBe('link');
    expect(action).toHaveBeenCalledTimes(2);
    expect(calls).toEqual(['options', 'authenticate:c', 'verify:cred']);
  });

  it('does not loop when the retry still requires a step-up', async () => {
    const { steps, calls } = makeSteps();
    const action = vi.fn().mockRejectedValue(stepUpRequired());
    await expect(runWithStrongStepUp(action, steps)).rejects.toMatchObject({ code: 'STEP_UP_REQUIRED' });
    expect(action).toHaveBeenCalledTimes(2);
    expect(calls.filter((call) => call === 'options')).toHaveLength(1);
  });

  it('passes other errors through without touching the passkey', async () => {
    const { steps, calls } = makeSteps();
    const action = vi.fn().mockRejectedValue(new RacePicApiError(502, 'STRIPE_UNAVAILABLE'));
    await expect(runWithStrongStepUp(action, steps)).rejects.toMatchObject({ code: 'STRIPE_UNAVAILABLE' });
    expect(action).toHaveBeenCalledTimes(1);
    expect(calls).toEqual([]);
    await expect(runWithStrongStepUp(vi.fn().mockRejectedValue(new Error('offline')), steps)).rejects.toThrow('offline');
  });

  it('never retries the action when the passkey confirmation fails', async () => {
    const { steps } = makeSteps({ authenticate: async () => { throw new DOMException('cancelled', 'NotAllowedError'); } });
    const action = vi.fn().mockRejectedValue(stepUpRequired());
    await expect(runWithStrongStepUp(action, steps)).rejects.toMatchObject({ name: 'NotAllowedError' });
    expect(action).toHaveBeenCalledTimes(1);

    const failedVerify = makeSteps({ verify: async () => { throw new RacePicApiError(401, 'VERIFICATION_FAILED'); } });
    const secondAction = vi.fn().mockRejectedValue(stepUpRequired());
    await expect(runWithStrongStepUp(secondAction, failedVerify.steps)).rejects.toMatchObject({ code: 'VERIFICATION_FAILED' });
    expect(secondAction).toHaveBeenCalledTimes(1);
  });

  it('propagates a missing passkey from the challenge request', async () => {
    const { steps } = makeSteps({ fetchOptions: async () => { throw new RacePicApiError(409, 'PASSKEY_REQUIRED'); } });
    const error = await runWithStrongStepUp(vi.fn().mockRejectedValue(stepUpRequired()), steps).catch((caught) => caught);
    expect(isPasskeyRequired(error)).toBe(true);
    expect(isPasskeyRequired(new Error('x'))).toBe(false);
  });
});

describe('payoutsErrorMessage', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => undefined));
  afterEach(() => vi.restoreAllMocks());

  it('maps browser and backend errors to readable German messages', () => {
    expect(payoutsErrorMessage(new DOMException('x', 'NotAllowedError'))).toMatch(/abgebrochen/);
    expect(payoutsErrorMessage(new DOMException('x', 'InvalidStateError'))).toMatch(/bereits für dein Konto registriert/);
    expect(payoutsErrorMessage(new RacePicApiError(409, 'ONBOARDING_INCOMPLETE'))).toMatch(/Stripe/);
    expect(payoutsErrorMessage(new RacePicApiError(404, 'COMMERCE_DISABLED'))).toMatch(/noch nicht freigeschaltet/);
    expect(payoutsErrorMessage(new RacePicApiError(500, 'SOMETHING'))).toMatch(/später erneut/);
    expect(payoutsErrorMessage('boom')).toMatch(/später erneut/);
  });
});
