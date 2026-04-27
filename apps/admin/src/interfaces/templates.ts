import { Template } from "@/hooks";

export interface TemplatesData {
  templates: Template[];
  count: number;
}

export enum TemplateType {
  DEFAULT = "Default",
  PERSONAL = "Personal",
}
