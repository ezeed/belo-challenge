import { ApiError, apiErrorFromStatus, isTransientApiError } from './api-error';

describe('apiErrorFromStatus', () => {
  it('maps 429 to RATE_LIMIT and converts Retry-After seconds to ms', () => {
    const error = apiErrorFromStatus(429, '2');
    expect(error.code).toBe('RATE_LIMIT');
    expect(error.retryAfterMs).toBe(2000);
  });

  it('leaves retryAfterMs undefined when the header is missing or invalid', () => {
    expect(apiErrorFromStatus(429, null).retryAfterMs).toBeUndefined();
    expect(apiErrorFromStatus(429, 'soon').retryAfterMs).toBeUndefined();
  });

  it('maps 5xx to SERVER_ERROR', () => {
    expect(apiErrorFromStatus(500).code).toBe('SERVER_ERROR');
    expect(apiErrorFromStatus(503).code).toBe('SERVER_ERROR');
  });

  it('maps other statuses to UNKNOWN', () => {
    expect(apiErrorFromStatus(404).code).toBe('UNKNOWN');
    expect(apiErrorFromStatus(400).code).toBe('UNKNOWN');
  });
});

describe('isTransientApiError', () => {
  it.each(['RATE_LIMIT', 'NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'] as const)(
    'treats %s as transient',
    (code) => {
      expect(isTransientApiError(new ApiError(code))).toBe(true);
    },
  );

  it('treats UNKNOWN and foreign errors as permanent', () => {
    expect(isTransientApiError(new ApiError('UNKNOWN'))).toBe(false);
    expect(isTransientApiError(new Error('boom'))).toBe(false);
  });
});
