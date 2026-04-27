import { useMutation } from '@tanstack/react-query';
import { serverAxios } from '@/lib/axios';

import { ValidatorType } from '../modules/settings/settings-api';

export const useUpdateValidatorPortkeyConfig = () => {
  return useMutation({
    mutationFn: async (defaultService: ValidatorType) => {

      const grokTarget = {
        provider: "@report-validation-grok",
        retry: {
          attempts: 1,
          on_status_codes: [429, 500, 502, 503, 504],
          use_retry_after_headers: true
        }
      };

      const geminiTarget = {
        provider: "@report-validation-google",
        retry: {
          attempts: 1,
          on_status_codes: [429, 500, 502, 503, 504],
          use_retry_after_headers: true
        }
      };

      let targets = [geminiTarget, grokTarget];
      if (defaultService === 'gemini') {
        targets = [geminiTarget, grokTarget];
      } else if (defaultService === 'grok') {
        targets = [grokTarget, geminiTarget];
      }

      const payload = {
        config: {
          request_timeout: 30000,
          strategy: {
            mode: "fallback",
            on_status_codes: [429, 500, 502, 503, 504, 400, 401],
            cb_config: {
              failure_threshold: 1,
              cooldown_interval: 60000,
              failure_status_codes: [429, 500, 502, 503, 504, 400, 401]
            }
          },
          targets
        }
      };

      const response = await serverAxios.put('/portkey/validation-config', payload);

      return response.data;
    }
  });
};
