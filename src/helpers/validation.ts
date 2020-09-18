import { ExtendedRequest, ValidationFailure } from '@typings';
import { validationResult } from 'express-validator';

export const extractValidationErrors = (req: ExtendedRequest) => {
  const errors = validationResult(req);
  const failures: ValidationFailure[] = [];

  if (!errors.isEmpty()) {
    for (const err of errors.array()) {
      failures.push({ field: err.param, message: req.__(err.msg) });
    }
  }
  return failures;
};
