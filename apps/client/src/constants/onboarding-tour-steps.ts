
export const steps = [
    {
        popover: {
            title: 'Create a New Report',
            description: "Click the “New Report” button to begin.This starts a new case for structured medical report generation.",
        },
        element: ".new-report-btn",
    },
    {
        element: '.study-type-input',
        popover: {
            title: 'Choose Your Preferred Mode',
            description: "Select how you'd like to create your report:Default Mode: Uses FlowRad’s proprietary engine to generate reports without a predefined template.Template Mode: Allows you to use your uploaded templates or choose from built-in system templates.",
        }
    },
    // {
    //     element: '.study-name-input',
    //     popover: {
    //         title: 'Enter Study Name',
    //         description: "Optionally, type the name of the study or scan (e.g., “MRI Knee”, “CT Abdomen”)..",
    //     }
    // },
    {
        element: '.findings-textarea',
        popover: {
            title: 'Add Findings',
            description: 'Input the key scan findings.These form the clinical backbone of the generated report.',
        }
    },
    {
        element: '.custom-profile-btn',
        popover: {
            title: 'Fill in Custom Profile',
            description: 'Select or enter any user-specific details to personalise the report.Leave it blank if customisation isn’t required.',
        }
    },
    {
        element: '.mic-btn',
        popover: {
            title: 'Use Voice Dictation',
            description:
                "Click the microphone icon to start dictating findings.• Use the pause button to momentarily pause dictation.• Click the mic icon again to finish dictation.You can continue adding or editing findings by typing or speaking.",
        }
    },
    {
        element: '.generate-btn',
        popover: {
            title: 'Generate the Report',
            description: 'Click the “Generate” button to create your report.The output will appear in the main results section.',
        }
    },
    {
        element: '.current-tab-btn',
        popover: {
            title: 'Review & Copy Report (Current Tab)',
            description: 'The generated report is displayed here.Use the Copy button to copy as plain text or formatted text (preserving structure and styles).',
        }
    },
    {
        element: '.template-selection',
        popover: {
            title: 'Access Templates',
            description: 'Use the template search bar to find system templates or upload your own for reuse.',
        }
    },
    {
        element: '.report-list',
        popover: {
            title: 'Report History',
            description: "Browse previously created reports here.You can view, copy, download, or continue editing any past case.",
        }
    },
    {
        element: '.action-mode-btn',
        popover: {
            title: 'Action Mode',
            description: 'Turn on Action Mode to auto-generate reports after each voice input — no need to click the Generate button. Works better for follow up corrections in the first generated version of the report.',
        }
    },
    {
        element: '.auto-refine-btn',
        popover: {
            title: 'Auto-Refine Mode',
            description: 'Enable AutoRefine to automatically polish dictated input — converting casual or imperfect speech into professional, structured medical language.',
        }
    },
    {
        element: '.text-crrection-btn',
        popover: {
            title: 'Text Correction',
            description: 'Use this feature to fix any spelling or dictation errors in your findings before generating the final report.',
        }
    },
    {
        element: '.report-btn',
        popover: {
            title: 'Report Credits',
            description: 'Check your remaining credits here.You can also buy more credits directly from this section when needed.',
        }
    }
];
