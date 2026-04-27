export const validateMicrophone = async (): Promise<boolean> => {
    try {
      // Get audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMic = devices.some(device => device.kind === "audioinput");
  
      if (!hasMic) {
        return false;
      }
  
      // Try to get permission to use the mic
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error("Microphone validation error:", error);
      return false;
    }
};