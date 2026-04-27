export interface InstructionStep {
  title: string;
  items: {
    heading?: string;
    content?: string;
    subItems?: string[];
  }[];
}

export const instructionSteps: InstructionStep[] = [
  {
    title: "Step 1: Start Your Study",
    items: [
      {
        heading: "Enter the Study Name:",
        content:
          "Include the imaging modality and region of interest (e.g., CECT Chest, NCCT KUB, MRCP, or CEMRI Brain and Orbits).",
      },
      {
        heading: "Add Relevant Findings:",
        content:
          "Provide detailed positive findings specific to the study, ensuring clarity and precision. For CT/MRI Abdomen and Pelvis studies, remember to comment on gender-specific organs (e.g., prostate, uterus, ovaries) separately.",
      },
      {
        heading: "Aim for Accuracy:",
        content:
          "Detailed and accurate inputs enable the AI to generate a comprehensive and precise report.",
      },
    ],
  },
  {
    title: "Step 2: Refine Your Report",
    items: [
      {
        heading: "Ask Follow-Up Questions:",
        content:
          "Use up to 5 follow-up messages per report to refine the content, clarify findings, or modify details.",
      },
      {
        heading: "Elaborate with a Click:",
        content:
          "Use the Elaborate button to make the report more detailed, especially for sections involving positive findings.",
      },
      {
        heading: "Be Specific:",
        content:
          "Frame questions clearly and concisely for tailored and meaningful responses.",
      },
    ],
  },
  {
    title: "Step 3: Finalize and Move Forward",
    items: [
      {
        heading: "Save Your Report:",
        content:
          "Once you are satisfied with the responses and refinements, finalize the report to save it within the report thread memory. Select and copy the output text to your preferred destination for submission. No integration with PACS required.",
      },
      {
        heading: "Start a New Study:",
        content:
          "To create a new report, click the New Study button to begin fresh.",
      },
    ],
  },
];

export const proTips: InstructionStep = {
  title: "Pro Tips for Maximizing Productivity",
  items: [
    {
      heading: "Use Specific Diagnoses for Provisional Reports:",
      subItems: [
        "Mention a study name and specific diagnosis, such as Acute Edematous Interstitial Pancreatitis, to create a quick provisional report.",
        "Use the Elaborate button to expand the report into a detailed version, which can be further customized based on patient findings.",
      ],
    },
    {
      heading: "Leverage the Structured Reporting Approach:",
      subItems: [
        "Click the Structured Reporting Approach button to generate a checklist for specific pathologies (e.g., Dandy-Walker Malformation, Carcinoma Rectum on MRI).",
        "This checklist provides a systematic approach to analyzing and reporting the scan.",
      ],
    },
    {
      heading: "Calculate Volumes Efficiently:",
      subItems: [
        "Enter dimensions (e.g., three measurements for the prostate or liver abscess) and use Add Volume after mentioning the dimensions, to calculate the ellipsoid volume automatically.",
      ],
    },
    {
      heading: "Integrate Scoring Systems:",
      subItems: [
        'Enter specific instructions like "Add Modified CT Severity Index/MCTSI" or "Add CAD-RADS" to include standardized scoring systems in the final report.',
        "The assistant will calculate these based on the provided findings.",
      ],
    },
  ],
};

export const bestPractices: InstructionStep = {
  title: "Tips for Best Results",
  items: [
    {
      content: "Provide clear, structured inputs to maximize AI efficiency.",
    },
    {
      content:
        "Use the Elaborate feature for detailed reports where applicable.",
    },
    {
      content: "Save finalized reports to avoid losing important data.",
    },
  ],
};

export const instructionsTitle = "Instructions for Using Flowrad AI";

export const shortcutKeys: InstructionStep = {
  title: "Shortcut Keys",
  items: [
    {
      content: "New Session: N"
    },
    {
      content: "Start Recording: R"
    },
    {
      content: "Stop Recording: R (Once started)"
    },
    {
      content: "Pause recording: P"
    },
    {
      content: "Copy Report: C"
    }
  ]
}