import { useMutation } from '@tanstack/react-query';
import { serverAxios } from '@/lib/axios';

import { RefineType } from '../modules/settings/settings-api';

export const useUpdateRefinePortkeyConfig = () => {
  return useMutation({
    mutationFn: async (defaultService: RefineType) => {
      const groqTarget = {
        provider: "@text-refine-groq",
        retry: {
          attempts: 1,
          on_status_codes: [429, 500, 502, 503, 504],
          use_retry_after_headers: true
        }
      };

      const geminiTarget = {
        provider: "@text-refine-google",
        retry: {
          attempts: 1,
          on_status_codes: [429, 500, 502, 503, 504],
          use_retry_after_headers: true
        }
      };

      let targets = [geminiTarget, groqTarget];
      if (defaultService === 'gemini') {
        targets = [geminiTarget, groqTarget];
      } else if (defaultService === 'groq') {
        targets = [groqTarget, geminiTarget];
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

      const response = await serverAxios.put('/portkey/refine-config', payload);

      return response.data;
    }
  });
};
