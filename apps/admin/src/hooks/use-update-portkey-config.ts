import { useMutation } from '@tanstack/react-query';
import { serverAxios } from '@/lib/axios';

import { LLMType } from '../modules/settings/settings-api';

export const useUpdatePortkeyConfig = () => {
  return useMutation({
    mutationFn: async (defaultService: LLMType) => {
      const grokTarget = {
        provider: "@report-generation-grok",
        retry: {
          attempts: 1,
          on_status_codes: [429, 500, 502, 503, 504, 400, 401],
          use_retry_after_headers: true
        }
      };

      const groqTarget = {
        provider: "@report-generation-groq",
        retry: {
          attempts: 1,
          on_status_codes: [429, 500, 502, 503, 504],
          use_retry_after_headers: true
        }
      };

      const openrouterTarget = {
        provider: "@report-generation-openrouter",
        retry: {
          attempts: 1,
          on_status_codes: [429, 500, 502, 503, 504],
          use_retry_after_headers: true
        }
      }

      const geminiTarget = {
        provider: "@report-generation-google",
        retry: {
          attempts: 1,
          on_status_codes: [429, 500, 502, 503, 504],
          use_retry_after_headers: true
        }
      };

      let targets = [grokTarget, groqTarget, geminiTarget];
      if (defaultService === 'grok') {
        targets = [grokTarget, groqTarget, geminiTarget];
      } else if (defaultService === 'groq') {
        targets = [groqTarget, grokTarget, geminiTarget];
      } else if (defaultService === 'gemini') {
        targets = [geminiTarget, grokTarget, groqTarget];
      } else if (defaultService === 'openrouter') {
        targets = [openrouterTarget, grokTarget, groqTarget, geminiTarget];
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

      const response = await serverAxios.put('/portkey/config', payload);

      return response.data;
    }
  });
};
