import { Response } from "express";
import axios from "axios";
import logger from "../../core/logger";
import { getPortkeyConfig } from "../../config/env/portkey";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";

class PortkeyController {
  private getHeaders() {
    const { apiKey, workspaceId } = getPortkeyConfig();
    if (!apiKey) throw new Error("PORTKEY_API_KEY is not configured");
    const headers: Record<string, string> = {
      "x-portkey-api-key": apiKey,
      "Content-Type": "application/json",
    };
    if (workspaceId) {
      headers["x-portkey-workspace-id"] = workspaceId;
    }
    return headers;
  }

  async getProviders(req: AuthenticatedRequest, res: Response) {
    try {
      const { workspaceId, baseUrl } = getPortkeyConfig();
      const url = workspaceId
        ? `${baseUrl}/providers?workspace_id=${workspaceId}`
        : `${baseUrl}/providers`;

      const response = await axios.get(url, { headers: this.getHeaders() });
      return res.status(200).json(response.data);
    } catch (error) {
      logger.error("Error fetching Portkey providers:", error);
      return res.status(500).json({ error: "Failed to fetch Portkey providers" });
    }
  }

  async getModels(req: AuthenticatedRequest, res: Response) {
    try {
      const { slug } = req.params;
      const { workspaceId, baseUrl } = getPortkeyConfig();
      const url = workspaceId
        ? `${baseUrl}/integrations/${slug}/models?workspace_id=${workspaceId}`
        : `${baseUrl}/integrations/${slug}/models`;

      const response = await axios.get(url, { headers: this.getHeaders() });
      return res.status(200).json(response.data);
    } catch (error: any) {
      logger.error("Error fetching Portkey models:", error?.response?.data || error?.message);
      return res.status(error?.response?.status || 500).json({
        error: "Failed to fetch Portkey models",
        detail: error?.response?.data,
      });
    }
  }

  async updateConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const { configId, baseUrl } = getPortkeyConfig();
      if (!configId) throw new Error("PORTKEY_CONFIG_ID is not configured");

      const response = await axios.put(
        `${baseUrl}/configs/${configId}`,
        req.body,
        { headers: this.getHeaders() }
      );
      return res.status(200).json(response.data);
    } catch (error) {
      logger.error("Error updating Portkey config:", error);
      return res.status(500).json({ error: "Failed to update Portkey config" });
    }
  }

//   async updateAudioConfig(req: AuthenticatedRequest, res: Response) {
//     try {
//       const { audio, baseUrl } = getPortkeyConfig();
//       if (!audio.configId) throw new Error("PORTKEY_AUDIO_CONFIG_ID is not configured");
//       if (!audio.apiKey) throw new Error("PORTKEY_AUDIO_API_KEY is not configured");

//       const response = await axios.put(
//         `${baseUrl}/configs/${audio.configId}`,
//         req.body,
//         {
//           headers: {
//             "x-portkey-api-key": audio.apiKey,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       return res.status(200).json(response.data);
//     } catch (error: any) {
//       logger.error("Error updating Portkey audio config:", error?.response?.data || error?.message);
//       return res.status(error?.response?.status || 500).json({ error: "Failed to update Portkey audio config" });
//     }
//   }

  async updateRefineConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const { refine, baseUrl } = getPortkeyConfig();
      if (!refine.configId) throw new Error("PORTKEY_AUDIO_CONFIG_ID is not configured");
      if (!refine.apiKey) throw new Error("PORTKEY_AUDIO_API_KEY is not configured");

      const response = await axios.put(
        `${baseUrl}/configs/${refine.configId}`,
        req.body,
        {
          headers: {
            "x-portkey-api-key": refine.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      return res.status(200).json(response.data);
    } catch (error: any) {
      logger.error("Error updating Portkey audio config:", error?.response?.data || error?.message);
      return res.status(error?.response?.status || 500).json({ error: "Failed to update Portkey audio config" });
    }
  }

  async updateValidationConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const { validation, baseUrl } = getPortkeyConfig();
      if (!validation.configId) throw new Error("PORTKEY_AUDIO_CONFIG_ID is not configured");
      if (!validation.apiKey) throw new Error("PORTKEY_AUDIO_API_KEY is not configured");

      const response = await axios.put(
        `${baseUrl}/configs/${validation.configId}`,
        req.body,
        {
          headers: {
            "x-portkey-api-key": validation.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      return res.status(200).json(response.data);
    } catch (error: any) {
      logger.error("Error updating Portkey audio config:", error?.response?.data || error?.message);
      return res.status(error?.response?.status || 500).json({ error: "Failed to update Portkey audio config" });
    }
  }
}

export default new PortkeyController();