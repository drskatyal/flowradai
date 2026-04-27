export const hasEmptyPromptField = (speciality: any): boolean => {
    if (!speciality?.prompt) return true; // If prompt itself is missing, consider as empty

    return Object.values(speciality.prompt).some(value => {
        return typeof value === "string" && value.trim() === "";
    });
}