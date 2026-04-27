import { create } from 'zustand';

export type Speciality = { id: string; name: string; icon: string };

export type User = {
  id: string; firstName: string; lastName: string; email: string;
  specialityId: string; specialityName: string;
  availableCredits: number; totalCredits: number;
  status: 'onboarding' | 'active';
  settings: {
    autoTemplate: boolean; actionMode: boolean;
    defaultTranscriptionModel: string;
    isErrorCheck: boolean; isReportGuideline: boolean;
    voiceCommandsEnabled: boolean;
  };
};

export type Template = {
  id: string; title: string; description: string;
  specialityId: string; type: 'private' | 'public';
  category: 'normal' | 'abnormal' | ''; prompt: string;
};

export type Macro = {
  id: string; name: string; description: string;
  isActive: boolean; isPublic: boolean; specialityId?: string;
};

export type ChatMessage = {
  id: string; role: 'user' | 'assistant';
  content: string; transcription?: string;
  templateTitle?: string; category?: 'normal' | 'abnormal' | '';
  model?: string; createdAt: string;
};

export type Report = {
  id: string; threadId: string; title: string; content: string;
  transcription: string; templateId?: string; templateTitle?: string;
  category: 'normal' | 'abnormal' | ''; createdAt: string; model: string;
};

type AppState = {
  isAuthenticated: boolean; hasCompletedOnboarding: boolean;
  user: User | null; token: string | null;
  messages: ChatMessage[];
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setOnboardingComplete: () => void;
  updateUser: (updates: Partial<User>) => void;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false, hasCompletedOnboarding: false,
  user: null, token: null, messages: [],
  setAuth: (user, token) => set({
    isAuthenticated: true, user, token,
    hasCompletedOnboarding: user.status === 'active',
  }),
  clearAuth: () => set({ isAuthenticated: false, user: null, token: null, hasCompletedOnboarding: false }),
  setOnboardingComplete: () => set((s) => ({
    hasCompletedOnboarding: true,
    user: s.user ? { ...s.user, status: 'active' } : null,
  })),
  updateUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
}));

// ─── Mock data ─────────────────────────────────────────────────────────────────
export const MOCK_SPECIALITIES: Speciality[] = [
  { id: '1', name: 'Chest Radiology', icon: '🫁' },
  { id: '2', name: 'Neuroradiology', icon: '🧠' },
  { id: '3', name: 'Musculoskeletal', icon: '🦴' },
  { id: '4', name: 'Abdominal', icon: '🫀' },
  { id: '5', name: 'Cardiovascular', icon: '❤️' },
  { id: '6', name: 'Breast Imaging', icon: '🔬' },
  { id: '7', name: 'Interventional', icon: '⚕️' },
  { id: '8', name: 'Nuclear Medicine', icon: '☢️' },
  { id: '9', name: 'Paediatric', icon: '👶' },
  { id: '10', name: 'Emergency', icon: '🚨' },
];

export const MOCK_TEMPLATES: Template[] = [
  { id: 't1', title: 'Chest X-Ray — Normal', description: 'Standard PA/AP CXR with no acute findings', specialityId: '1', type: 'public', category: 'normal', prompt: 'Generate a formal radiology report for a normal chest X-ray.' },
  { id: 't2', title: 'CT Head — No Contrast', description: 'Non-contrast CT head for trauma/acute change', specialityId: '2', type: 'public', category: 'normal', prompt: 'Generate a radiology report for a non-contrast CT head study.' },
  { id: 't3', title: 'MRI Lumbar Spine', description: 'Lumbar spine MRI with disc assessment', specialityId: '3', type: 'public', category: 'abnormal', prompt: 'Generate a formal radiology report for an MRI lumbar spine.' },
  { id: 't4', title: 'CT Abdomen/Pelvis + Contrast', description: 'Contrast-enhanced CTAP for abdominal pathology', specialityId: '4', type: 'public', category: 'abnormal', prompt: 'Generate a radiology report for a contrast-enhanced CT abdomen and pelvis.' },
  { id: 't5', title: 'CXR — Pleural Effusion', description: 'Chest X-ray with pleural effusion assessment', specialityId: '1', type: 'public', category: 'abnormal', prompt: 'Generate a report for chest X-ray showing pleural effusion.' },
  { id: 't6', title: 'CT Pulmonary Angiogram', description: 'CTPA for pulmonary embolism evaluation', specialityId: '1', type: 'public', category: 'normal', prompt: 'Generate a CTPA radiology report evaluating for pulmonary embolism.' },
  { id: 't7', title: 'MRI Brain — With/Without', description: 'Brain MRI with and without contrast', specialityId: '2', type: 'private', category: 'normal', prompt: 'Generate a formal radiology report for MRI brain with and without gadolinium contrast.' },
  { id: 't8', title: 'X-Ray Knee AP/Lat', description: 'AP and lateral knee radiograph', specialityId: '3', type: 'private', category: 'normal', prompt: 'Generate a report for AP and lateral knee radiographs.' },
];

export const MOCK_MACROS: Macro[] = [
  { id: 'm1', name: 'normal chest', description: 'No acute cardiopulmonary findings. Heart size normal, cardiothoracic ratio within normal limits. Mediastinum unremarkable. Lungs clear bilaterally. No pleural effusion or pneumothorax identified.', isActive: true, isPublic: true, specialityId: '1' },
  { id: 'm2', name: 'effusion', description: 'Moderate pleural effusion identified. Associated compressive atelectasis at the ipsilateral base. No pneumothorax.', isActive: true, isPublic: true, specialityId: '1' },
  { id: 'm3', name: 'fracture rib', description: 'Acute rib fracture identified at the site of injury. No associated pneumothorax. Underlying lung parenchyma appears intact.', isActive: true, isPublic: false, specialityId: '1' },
  { id: 'm4', name: 'normal brain', description: 'No acute intracranial abnormality identified. No haemorrhage, infarction, or space-occupying lesion. Ventricles and sulci appear appropriate for age.', isActive: true, isPublic: true, specialityId: '2' },
  { id: 'm5', name: 'disc protrusion', description: 'Disc protrusion identified causing neural foraminal narrowing and nerve root impingement at the affected level, correlating with clinical radicular symptoms.', isActive: true, isPublic: true, specialityId: '3' },
  { id: 'm6', name: 'normal knee', description: 'Bony alignment maintained. Joint spaces preserved bilaterally. No acute fracture, dislocation, or significant degenerative change identified.', isActive: true, isPublic: false, specialityId: '3' },
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'r1', threadId: 'th1', title: 'CXR — John Smith, 67M',
    content: `CHEST X-RAY — PA VIEW\n\nCLINICAL INDICATION: Shortness of breath.\n\nTECHNIQUE: PA erect chest radiograph.\n\nFINDINGS:\nThe heart is not enlarged. The cardiothoracic ratio is within normal limits at approximately 0.48.\n\nThe mediastinum is central and of normal calibre. The trachea is central.\n\nBoth lung fields are clear. No focal consolidation, pleural effusion or pneumothorax identified. The lung markings are visible to the periphery bilaterally.\n\nThe bony thorax appears intact. No acute rib fractures identified.\n\nIMPRESSION:\nNo acute cardiopulmonary abnormality.`,
    transcription: 'Normal chest X-ray, no acute findings, heart not enlarged, lungs clear bilaterally, no effusion no pneumothorax',
    templateId: 't1', templateTitle: 'Chest X-Ray — Normal',
    category: 'normal', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), model: 'Grok',
  },
  {
    id: 'r2', threadId: 'th2', title: 'CT Head — Mary Jones, 54F',
    content: `CT HEAD WITHOUT CONTRAST\n\nCLINICAL INDICATION: Headache and confusion.\n\nTECHNIQUE: Axial CT images through the brain without intravenous contrast.\n\nFINDINGS:\nNo acute intracranial haemorrhage. No midline shift. No mass effect.\n\nMild periventricular white matter hypodensities consistent with small vessel ischaemic changes.\n\nThe ventricles are symmetric and not dilated.\n\nIMPRESSION:\n1. No acute intracranial haemorrhage or space-occupying lesion.\n2. Mild small vessel ischaemic changes — chronic in appearance.`,
    transcription: 'CT head no contrast, no haemorrhage, mild periventricular white matter changes, no mass effect',
    templateId: 't2', templateTitle: 'CT Head — No Contrast',
    category: 'abnormal', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), model: 'GPT-4o',
  },
];

export const TRANSCRIPTION_SAMPLES: Record<string, string> = {
  default: 'Chest X-ray PA view. Heart is not enlarged, cardiothoracic ratio approximately 0.48. Mediastinum central, trachea midline. Both lung fields clear, no focal consolidation, no pleural effusion, no pneumothorax. Bony thorax intact.',
  neuro: 'CT head without contrast. No acute intracranial haemorrhage. No midline shift or mass effect. Mild periventricular white matter changes. Ventricles symmetric and not dilated.',
  msk: 'MRI lumbar spine. L4 L5 left paracentral disc protrusion with left L5 nerve root impingement. Multilevel degenerative changes. Normal conus termination at L1.',
};

export const REPORT_SAMPLES: Record<string, string> = {
  default: `CHEST X-RAY — PA VIEW

CLINICAL INDICATION: As per clinical request.

TECHNIQUE: PA erect chest radiograph.

FINDINGS:
The heart is not enlarged. The cardiothoracic ratio is within normal limits at approximately 0.48.

The mediastinum is central and of normal calibre. The trachea is central.

Both lung fields are clear. No focal consolidation, pleural effusion or pneumothorax identified. The lung markings are visible to the periphery bilaterally.

The bony thorax appears intact. No acute rib fractures identified.

IMPRESSION:
No acute cardiopulmonary abnormality.`,
  neuro: `CT HEAD WITHOUT CONTRAST

CLINICAL INDICATION: As per clinical request.

TECHNIQUE: Axial CT images through the brain without intravenous contrast.

FINDINGS:
No acute intracranial haemorrhage identified. No midline shift. No mass effect or herniation.

Mild periventricular white matter hypodensities are present, consistent with small vessel ischaemic change. These appear chronic in nature.

The ventricles are symmetric and not dilated. The sulci are patent. Posterior fossa structures appear unremarkable.

The visualised bony calvarium is intact.

IMPRESSION:
1. No acute intracranial haemorrhage or space-occupying lesion.
2. Mild small vessel ischaemic changes — chronic in appearance.
   Clinical correlation recommended.`,
};
