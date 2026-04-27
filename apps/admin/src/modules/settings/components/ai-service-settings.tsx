"use client";

import { useState, useEffect } from "react";
import { useAIServiceSettings } from "../use-ai-service-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Brain,
  Mic,
  Wand2,
  ShieldCheck,
  Search,
  Database,
  Info
} from "lucide-react";
import {
  LLMType,
  TranscriptionType,
  RefineType,
  ValidatorType,
  ResearchType,
  EmbeddingType
} from "../settings-api";
import { usePortkeyProviders } from "@/hooks/use-portkey-providers";
import { usePortkeyModels } from "@/hooks/use-portkey-models";

export const AIServiceSettings = () => {
  const {
    settings,
    isLoading,
    updateLocalSettings,
    saveSettings,
    isUpdating
  } = useAIServiceSettings();

  const { data: providers, isLoading: isLoadingProviders } = usePortkeyProviders();
  // const { data: grokModels } = usePortkeyModels({ slug: 'report-generation-grok', provider: 'xai' });
  // const { data: groqModels } = usePortkeyModels({ slug: 'report-generation-groq', provider: 'groq' });

  const { models, loading, error, responseData, filters, handleFilterChange, handleApplyFilters, handleReset, fetchModels } = usePortkeyModels();

  const mergeWithoutDuplicates = (primary: string[], secondary: string[]) => {
    const result = [...primary];

    for (const item of secondary) {
      if (!result.includes(item)) {
        result.push(item);
      }
    }

    return result;
  };

  const apiModels = models.map(m => m.id);

  const staticGrokModels = ['grok-4-1-fast-non-reasoning', 'grok-4-fast-non-reasoning'];
  const staticGroqModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  const staticGeminiModels = ['gemini-2.0-flash-lite', 'gemini-2.5-flash-lite'];
  const staticOpenRouterModels = ['openai/gpt-4o', 'openai/gpt-5', 'mistralai/voxtral-small-24b-2507'];

  const refineGeminiModels = ['gemini-2.5-flash-lite'];
  const refineGroqModels = ['llama-3.3-70b-versatile'];

  const [activeTab, setActiveTab] = useState<LLMType>('grok');
  const [activeAudioTab, setActiveAudioTab] = useState<TranscriptionType>('voxtral');
  const [activeRefineTab, setActiveRefineTab] = useState<RefineType>(settings?.refinement?.defaultService || 'gemini');
  const [activeValidationTab, setActiveValidationTab] = useState<ValidatorType>(settings?.validation?.defaultService || 'gemini');
  const [mainTab, setMainTab] = useState<'llm' | 'transcription' | 'refinement' | 'validation' | 'research' | 'embeddings'>('llm');

  const refineProviders = (providers?.filter(p => p.slug?.toLowerCase().includes('refine') || p.name?.toLowerCase().includes('refine')) || [])
  const reportProviders = providers?.filter(p => p.slug?.toLowerCase().includes('report-generation') || p.name?.toLowerCase().includes('report-generation')) || [];
  const validationProviders = providers?.filter(p => p.slug?.toLowerCase().includes('report-validation') || p.name?.toLowerCase().includes('report-validation')) || [];

  useEffect(() => {
    if (settings?.refinement?.defaultService) {
      setActiveRefineTab(settings.refinement.defaultService as RefineType);
    }
    if (settings?.validation?.defaultService) {
      setActiveValidationTab(settings.validation.defaultService as ValidatorType);
    }
  }, [settings?.refinement?.defaultService, settings?.validation?.defaultService]);

  if (isLoading || isLoadingProviders || !settings) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">Initializing AI Workspace</h3>
            <p className="text-muted-foreground animate-pulse text-sm">
              Fetching processing pipelines and model configurations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title, badge, description }: { icon: any, title: string, badge?: string, description?: string }) => (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>
        {badge && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1">
            {badge}
          </Badge>
        )}
      </div>
      {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
    </div>
  );

  const SidebarNavButton = <T extends string>({
    type,
    name,
    icon: Icon,
    isActive,
    isDefault,
    onClick
  }: {
    type: T,
    name: string,
    icon: any,
    isActive: boolean,
    isDefault: boolean,
    onClick: () => void
  }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border-2 ${isActive
          ? "bg-primary/5 border-primary shadow-sm"
          : "bg-transparent border-transparent hover:bg-muted/50 hover:border-muted-foreground/20"
          }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className={`font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{name}</span>
        </div>
        {isDefault && (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-green-500/10 text-green-600 border-green-500/20">
            Active
          </Badge>
        )}
      </button>
    );
  };

  return (
    <Card className="col-span-2 border-2 overflow-hidden rounded-2xl bg-background/50 backdrop-blur-sm">
      <CardHeader className="bg-muted/30 border-b pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">AI Compute Core</CardTitle>
              <CardDescription className="text-base text-muted-foreground font-medium">
                Distributed intelligence cluster and real-time processing pipelines.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-background/60 p-2 rounded-2xl border border-border/50 shadow-inner">
            {mainTab === 'llm' ? (
              <div className="px-4 py-2 border-border/50">
                <Label htmlFor="default-llm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Primary Engine
                </Label>
                <Select
                  value={settings.defaultService}
                  onValueChange={(value: string) => updateLocalSettings('defaultService', value as LLMType)}
                >
                  <SelectTrigger id="default-llm" className="h-9 bg-transparent border-none shadow-none font-bold text-sm focus:ring-0">
                    <SelectValue placeholder="Select Engine" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-xl">
                    {reportProviders?.map((p) => {
                      const val = p.provider === 'x-ai' ? 'grok' : p.provider === 'google' ? 'gemini' : p.provider;
                      return (
                        <SelectItem key={p.id} value={val} className="rounded-lg my-1">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <span>{p.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ) : mainTab === 'refinement' ? (
              <div className="px-4 py-2 border-border/50">
                <Label htmlFor="default-refine" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Active Pipeline
                </Label>
                <Select
                  value={settings.refinement?.defaultService}
                  onValueChange={(value: string) => updateLocalSettings('refinement.defaultService', value as RefineType)}
                >
                  <SelectTrigger id="default-refine" className="h-9 bg-transparent border-none shadow-none font-bold text-sm focus:ring-0">
                    <SelectValue placeholder="Select Refine Engine" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-xl">
                    {refineProviders.map((provider) => {
                      const val = provider.provider === 'groq' ? 'groq' : provider.provider === 'google' ? 'gemini' : provider.provider;
                      return <SelectItem key={provider.id} value={val} className="rounded-lg my-1">
                        <div className="flex items-center gap-2">
                          <Wand2 className="h-4 w-4" />
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    })}
                    {refineProviders.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">No refine providers found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : mainTab === 'validation' ? (
              <div className="px-4 py-2 border-border/50">
                <Label htmlFor="default-validator" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Active Validator
                </Label>
                <Select
                  value={settings.validation?.defaultService}
                  onValueChange={(value: string) => updateLocalSettings('validation.defaultService', value as ValidatorType)}
                >
                  <SelectTrigger id="default-validator" className="h-9 bg-transparent border-none shadow-none font-bold text-sm focus:ring-0">
                    <SelectValue placeholder="Select Validator Engine" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-xl">
                    {validationProviders.map((provider) => {
                      let val = provider.provider;
                      if (provider.slug?.toLowerCase().includes('grok') || provider.name?.toLowerCase().includes('grok')) val = 'grok';
                      else if (provider.slug?.toLowerCase().includes('google') || provider.name?.toLowerCase().includes('gemini')) val = 'gemini';

                      return <SelectItem key={provider.id} value={val} className="rounded-lg my-1">
                        <div className="flex items-center gap-2">
                          <Wand2 className="h-4 w-4" />
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    })}
                    {validationProviders.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">No validation providers found</div>
                    )}
                  </SelectContent>
                  {/* <SelectContent className="rounded-xl border-2 shadow-xl">
                    <SelectItem value="gemini" className="rounded-lg my-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Gemini</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="grok" className="rounded-lg my-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Grok</span>
                      </div>
                    </SelectItem>
                  </SelectContent> */}
                </Select>
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="llm" className="w-full" onValueChange={(val) => setMainTab(val as any)}>
          <div className="px-8 pt-6">
            <TabsList className="flex flex-wrap h-auto p-1 bg-muted/50 rounded-xl gap-1 border border-border/50">
              <TabsTrigger value="llm" className="flex-1 min-w-[120px] gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Brain className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-tight">Core LLM</span>
              </TabsTrigger>
              {/* <TabsTrigger value="transcription" className="flex-1 min-w-[120px] gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Mic className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-tight">Audio</span>
              </TabsTrigger> */}
              <TabsTrigger value="refinement" className="flex-1 min-w-[120px] gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Wand2 className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-tight">Refine</span>
              </TabsTrigger>
              <TabsTrigger value="validation" className="flex-1 min-w-[120px] gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-tight">Validator</span>
              </TabsTrigger>
              {/* <TabsTrigger value="research" className="flex-1 min-w-[120px] gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Search className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-tight">Research</span>
              </TabsTrigger>
              <TabsTrigger value="embeddings" className="flex-1 min-w-[120px] gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Database className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-tight">Vectors</span>
              </TabsTrigger> */}
            </TabsList>
          </div>

          <TabsContent value="llm" className="mt-6 border-t animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Sidebar Navigation */}
              <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r bg-muted/10 p-6 space-y-2 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
                  Available Providers
                </p>
                <SidebarNavButton
                  type="grok"
                  name="Grok AI"
                  icon={Brain}
                  isActive={activeTab === 'grok'}
                  isDefault={settings.defaultService === 'grok'}
                  onClick={() => setActiveTab('grok')}
                />
                <SidebarNavButton
                  type="groq"
                  name="Groq"
                  icon={Brain}
                  isActive={activeTab === 'groq'}
                  isDefault={settings.defaultService === 'groq'}
                  onClick={() => setActiveTab('groq')}
                />
                <SidebarNavButton
                  type="gemini"
                  name="Gemini"
                  icon={Brain}
                  isActive={activeTab === 'gemini'}
                  isDefault={settings.defaultService === 'gemini'}
                  onClick={() => setActiveTab('gemini')}
                />
                <SidebarNavButton
                  type="openrouter"
                  name="OpenRouter"
                  icon={Brain}
                  isActive={activeTab === 'openrouter'}
                  isDefault={settings.defaultService === 'openrouter'}
                  onClick={() => setActiveTab('openrouter')}
                />
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-1 p-4 bg-background relative overflow-y-auto max-h-[600px] custom-scrollbar">
                {activeTab === 'grok' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Brain}
                      title="Grok (xAI) Configuration"
                      badge={settings.defaultService === 'grok' ? "System Default" : ""}
                      description="High-performance reasoning and rapid-fire logical extraction."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label htmlFor="grok-model" className="text-sm font-bold">Inference Model</Label>
                        <Select
                          value={settings.llmConfig?.grok?.model || ""}
                          onValueChange={(value) => updateLocalSettings('llmConfig.grok.model', value)}
                        >
                          <SelectTrigger id="grok-model" className="bg-muted/20 border-2 border-transparent transition-all rounded-xl h-12 px-4 shadow-sm">
                            <SelectValue placeholder="Select Inference Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2">
                            {staticGrokModels.map((model) => (
                              <SelectItem key={model} value={model} className="rounded-lg m-1">{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Temperature</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.llmConfig?.grok?.temperature?.toFixed(1) ?? "0.7"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={2} step={0.1}
                            value={settings.llmConfig?.grok?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('llmConfig.grok.temperature', val)}
                            className="py-4"
                          />
                          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                            Controls randomness. Lower is more deterministic.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Top P</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.llmConfig?.grok?.topP?.toFixed(2) ?? "1.00"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={1} step={0.01}
                            value={settings.llmConfig?.grok?.topP ?? 1}
                            onValueChange={(val) => updateLocalSettings('llmConfig.grok.topP', val)}
                            className="py-4"
                          />
                          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                            Nuance threshold. 1.0 utilizes the full probability cloud.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-4">
                          <Label htmlFor="grok-reasoning" className="text-sm font-bold">Reasoning Effort</Label>
                          <Select
                            value={settings.llmConfig?.grok?.reasoningEffort || "medium"}
                            onValueChange={(value: 'low' | 'medium' | 'high') => updateLocalSettings('llmConfig.grok.reasoningEffort', value)}
                          >
                            <SelectTrigger id="grok-reasoning" className="bg-muted/20 border-2 border-transparent h-12 rounded-xl">
                              <SelectValue placeholder="Select effort" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                              <SelectItem value="low">Economic (Low)</SelectItem>
                              <SelectItem value="medium">Balanced (Medium)</SelectItem>
                              <SelectItem value="high">Complex (High)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="grok-tokens" className="text-sm font-bold">Token Budget</Label>
                          <div className="relative group">
                            <Input
                              id="grok-tokens"
                              type="number"
                              value={settings.llmConfig?.grok?.maxTokens ?? 2048}
                              onChange={(e) => updateLocalSettings('llmConfig.grok.maxTokens', parseInt(e.target.value))}
                              className="bg-muted/20 border-2 border-transparent h-12 rounded-xl pl-4 pr-12 transition-all font-mono"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground opacity-50">TOK</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'groq' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Brain}
                      title="Groq LPUI Integration"
                      badge={settings.defaultService === 'groq' ? "System Default" : ""}
                      description="Sub-second inference and massive parallel processing capacity."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label htmlFor="groq-model" className="text-sm font-bold">Inference Model</Label>
                        <Select
                          value={settings.llmConfig?.groq?.model || ""}
                          onValueChange={(value) => updateLocalSettings('llmConfig.groq.model', value)}
                        >
                          <SelectTrigger id="groq-model" className="bg-muted/20 border-2 border-transparent focus:border-primary transition-all rounded-xl h-12 px-4 shadow-sm">
                            <SelectValue placeholder="Select Groq Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2">
                            {staticGroqModels.map((model) => (
                              <SelectItem key={model} value={model} className="rounded-lg m-1">{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Temperature</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.llmConfig?.groq?.temperature?.toFixed(1) ?? "0.7"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={2} step={0.1}
                            value={settings.llmConfig?.groq?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('llmConfig.groq.temperature', val)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Top P</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.llmConfig?.groq?.topP?.toFixed(2) ?? "1.00"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={1} step={0.01}
                            value={settings.llmConfig?.groq?.topP ?? 1}
                            onValueChange={(val) => updateLocalSettings('llmConfig.groq.topP', val)}
                            className="py-4"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-4">
                          <Label htmlFor="groq-reasoning" className="text-sm font-bold">Reasoning Mode</Label>
                          <Select
                            value={settings.llmConfig?.groq?.reasoningEffort || "medium"}
                            onValueChange={(value: 'low' | 'medium' | 'high') => updateLocalSettings('llmConfig.groq.reasoningEffort', value)}
                          >
                            <SelectTrigger id="groq-reasoning" className="bg-muted/20 border-2 border-transparent h-12 rounded-xl">
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2 shadow-xl">
                              <SelectItem value="low">Rapid (Low)</SelectItem>
                              <SelectItem value="medium">Standard (Medium)</SelectItem>
                              <SelectItem value="high">Intensive (High)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="groq-tokens" className="text-sm font-bold">Emission Limit (Tokens)</Label>
                          <Input
                            id="groq-tokens"
                            type="number"
                            value={settings.llmConfig?.groq?.maxTokens ?? 2048}
                            onChange={(e) => updateLocalSettings('llmConfig.groq.maxTokens', parseInt(e.target.value))}
                            className="bg-muted/20 border-2 border-transparent h-12 rounded-xl px-4 focus:border-primary transition-all font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'gemini' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Brain}
                      title="Google Gemini v1.5/2.0"
                      badge={settings.defaultService === 'gemini' ? "System Default" : ""}
                      description="Massive context windows and multi-modal semantic understanding."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label htmlFor="gemini-model" className="text-sm font-bold">Inference Model</Label>
                        <Select
                          value={settings.llmConfig?.gemini?.model || ""}
                          onValueChange={(value) => updateLocalSettings('llmConfig.gemini.model', value)}
                        >
                          <SelectTrigger id="gemini-model" className="bg-muted/20 border-2 border-transparent transition-all rounded-xl h-12 px-4 shadow-sm">
                            <SelectValue placeholder="Select Gemini Version" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2">
                            {staticGeminiModels.map((model) => (
                              <SelectItem key={model} value={model} className="rounded-lg m-1">{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Temperature</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.llmConfig?.gemini?.temperature?.toFixed(1) ?? "0.7"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={2} step={0.1}
                            value={settings.llmConfig?.gemini?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('llmConfig.gemini.temperature', val)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Top P</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.llmConfig?.gemini?.topP?.toFixed(2) ?? "1.00"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={1} step={0.01}
                            value={settings.llmConfig?.gemini?.topP ?? 1}
                            onValueChange={(val) => updateLocalSettings('llmConfig.gemini.topP', val)}
                            className="py-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="gemini-tokens" className="text-sm font-bold">Context Generation Limit</Label>
                        <div className="relative group">
                          <Input
                            id="gemini-tokens"
                            type="number"
                            value={settings.llmConfig?.gemini?.maxTokens ?? 8192}
                            onChange={(e) => updateLocalSettings('llmConfig.gemini.maxTokens', parseInt(e.target.value))}
                            className="bg-muted/20 border-2 border-transparent h-12 rounded-xl pl-4 pr-12 transition-all font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                          Note: Gemini 1.5 Pro supports up to 1M+ tokens for input, but response generation output should be capped.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'openrouter' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Brain}
                      title="OpenRouter Gateway"
                      badge={settings.defaultService === 'openrouter' ? "System Default" : ""}
                      description="Unified routing across multiple model providers through OpenRouter."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label htmlFor="openrouter-model" className="text-sm font-bold">Inference Model</Label>
                        <Select
                          value={settings.llmConfig?.openrouter?.model || ""}
                          onValueChange={(value) => updateLocalSettings('llmConfig.openrouter.model', value)}
                        >
                          <SelectTrigger id="openrouter-model" className="bg-muted/20 border-2 border-transparent transition-all rounded-xl h-12 px-4 shadow-sm">
                            <SelectValue placeholder="Select OpenRouter Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2">
                            {staticOpenRouterModels.map((model) => (
                              <SelectItem key={model} value={model} className="rounded-lg m-1">{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Temperature</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.llmConfig?.openrouter?.temperature?.toFixed(1) ?? "0.7"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={2} step={0.1}
                            value={settings.llmConfig?.openrouter?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('llmConfig.openrouter.temperature', val)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Top P</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.llmConfig?.openrouter?.topP?.toFixed(2) ?? "1.00"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={1} step={0.01}
                            value={settings.llmConfig?.openrouter?.topP ?? 1}
                            onValueChange={(val) => updateLocalSettings('llmConfig.openrouter.topP', val)}
                            className="py-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="openrouter-tokens" className="text-sm font-bold">Token Budget</Label>
                        <Input
                          id="openrouter-tokens"
                          type="number"
                          value={settings.llmConfig?.openrouter?.maxTokens ?? 8192}
                          onChange={(e) => updateLocalSettings('llmConfig.openrouter.maxTokens', parseInt(e.target.value))}
                          className="bg-muted/20 border-2 border-transparent h-12 rounded-xl px-4 focus:border-primary transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Transcription Tab */}
          <TabsContent value="transcription" className="border-t animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Sidebar Navigation */}
              <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r bg-muted/10 p-6 space-y-2 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
                  Audio Pipelines
                </p>
                <SidebarNavButton
                  type="voxtral"
                  name="Voxtral"
                  icon={Mic}
                  isActive={activeAudioTab === 'voxtral'}
                  isDefault={settings.transcription?.defaultService === 'voxtral'}
                  onClick={() => setActiveAudioTab('voxtral')}
                />
                <SidebarNavButton
                  type="groq"
                  name="Whisper Groq"
                  icon={Mic}
                  isActive={activeAudioTab === 'groq'}
                  isDefault={settings.transcription?.defaultService === 'groq'}
                  onClick={() => setActiveAudioTab('groq')}
                />
                <SidebarNavButton
                  type="gemini"
                  name="Gemini Audio"
                  icon={Mic}
                  isActive={activeAudioTab === 'gemini'}
                  isDefault={settings.transcription?.defaultService === 'gemini'}
                  onClick={() => setActiveAudioTab('gemini')}
                />
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-1 p-4 bg-background relative overflow-y-auto max-h-[600px] custom-scrollbar">
                {activeAudioTab === 'voxtral' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Mic}
                      title="Voxtral Engine"
                      badge={settings.transcription?.defaultService === 'voxtral' ? "Pulse Default" : ""}
                      description="Optimized for high-fidelity transcription with Mistral backends."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="voxtral-model">Model ID</Label>
                          <Input
                            id="voxtral-model"
                            value={settings.transcription?.config?.voxtral?.model || ""}
                            onChange={(e) => updateLocalSettings('transcription.config.voxtral.model', e.target.value)}
                            className="bg-muted/20 border-2 border-transparent h-10 font-mono text-xs focus:border-primary transition-all rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="voxtral-lang">Language Code</Label>
                          <Input
                            id="voxtral-lang"
                            value={settings.transcription?.config?.voxtral?.language || "en"}
                            onChange={(e) => updateLocalSettings('transcription.config.voxtral.language', e.target.value)}
                            className="bg-muted/20 border-2 border-transparent h-10 focus:border-primary transition-all rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-3">
                          <Label>Temperature</Label>
                          <Slider
                            value={settings.transcription?.config?.voxtral?.temperature ?? 0}
                            onValueChange={(val) => updateLocalSettings('transcription.config.voxtral.temperature', val)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Generation Limit (Tokens)</Label>
                          <Input
                            type="number"
                            value={settings.transcription?.config?.voxtral?.maxTokens ?? 1024}
                            onChange={(e) => updateLocalSettings('transcription.config.voxtral.maxTokens', parseInt(e.target.value))}
                            className="bg-muted/20 border-2 border-transparent h-10 focus:border-primary transition-all rounded-xl font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeAudioTab === 'groq' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Mic}
                      title="Whisper on Groq"
                      badge={settings.transcription?.defaultService === 'groq' ? "Pulse Default" : ""}
                      description="Ultra-fast speech-to-text using Groq's LPUI infrastructure."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Model Version</Label>
                          <Input
                            value={settings.transcription?.config?.groq?.model || "whisper-large-v3"}
                            onChange={(e) => updateLocalSettings('transcription.config.groq.model', e.target.value)}
                            className="bg-muted/20 border-2 border-transparent h-10 font-mono text-xs focus:border-primary transition-all rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ISO Language</Label>
                          <Input
                            value={settings.transcription?.config?.groq?.language || "en"}
                            onChange={(e) => updateLocalSettings('transcription.config.groq.language', e.target.value)}
                            className="bg-muted/20 border-2 border-transparent h-10 focus:border-primary transition-all rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-3">
                          <Label>Temperature</Label>
                          <Slider
                            value={settings.transcription?.config?.groq?.temperature ?? 0}
                            onValueChange={(val) => updateLocalSettings('transcription.config.groq.temperature', val)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Output Tokens</Label>
                          <Input
                            type="number"
                            value={settings.transcription?.config?.groq?.maxTokens ?? 1024}
                            onChange={(e) => updateLocalSettings('transcription.config.groq.maxTokens', parseInt(e.target.value))}
                            className="bg-muted/20 border-2 border-transparent h-10 focus:border-primary transition-all rounded-xl font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeAudioTab === 'gemini' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Mic}
                      title="Gemini Multi-Modal Audio"
                      badge={settings.transcription?.defaultService === 'gemini' ? "Pulse Default" : ""}
                      description="Full audio comprehension and multi-modal scene analysis."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label>Gemini Audio Model</Label>
                        <Input
                          value={settings.transcription?.config?.gemini?.model || ""}
                          onChange={(e) => updateLocalSettings('transcription.config.gemini.model', e.target.value)}
                          className="bg-muted/20 border-2 border-transparent h-10 focus:border-primary transition-all rounded-xl font-mono"
                          placeholder="gemini-1.5-flash"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                        <div className="space-y-3">
                          <Label>Temperature</Label>
                          <Slider
                            value={settings.transcription?.config?.gemini?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('transcription.config.gemini.temperature', val)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Token Output Cap</Label>
                          <Input
                            type="number"
                            value={settings.transcription?.config?.gemini?.maxTokens ?? 2048}
                            onChange={(e) => updateLocalSettings('transcription.config.gemini.maxTokens', parseInt(e.target.value))}
                            className="bg-muted/20 border-2 border-transparent h-10 focus:border-primary transition-all rounded-xl font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Refinement Tab */}
          <TabsContent value="refinement" className="mt-6 border-t animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Sidebar Navigation */}
              <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r bg-muted/10 p-6 space-y-2 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
                  Refine Providers
                </p>
                <SidebarNavButton
                  type="gemini"
                  name="Gemini"
                  icon={Wand2}
                  isActive={activeRefineTab === 'gemini'}
                  isDefault={settings.refinement?.defaultService === 'gemini'}
                  onClick={() => setActiveRefineTab('gemini' as RefineType)}
                />
                <SidebarNavButton
                  type="groq"
                  name="Groq"
                  icon={Wand2}
                  isActive={activeRefineTab === 'groq'}
                  isDefault={settings.refinement?.defaultService === 'groq'}
                  onClick={() => setActiveRefineTab('groq' as RefineType)}
                />
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-1 p-8 bg-background relative overflow-y-auto max-h-[600px] custom-scrollbar">
                {activeRefineTab === 'gemini' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Wand2}
                      title="Gemini Refinement"
                      badge={settings.refinement?.defaultService === 'gemini' ? "Active Service" : ""}
                      description="Google-powered dynamic text refinement integration."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Inference Model</Label>
                        <Select
                          value={settings.refinement?.config?.gemini?.model || ""}
                          onValueChange={(value) => updateLocalSettings('refinement.config.gemini.model', value)}
                        >
                          <SelectTrigger className="bg-muted/20 border-2 border-transparent transition-all rounded-xl h-12 px-4 shadow-sm">
                            <SelectValue placeholder="Select Inference Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2">
                            {refineGeminiModels.map((model) => (
                              <SelectItem key={model} value={model} className="rounded-lg m-1">{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Temperature</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.refinement?.config?.gemini?.temperature?.toFixed(1) ?? "0.7"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={2} step={0.1}
                            value={settings.refinement?.config?.gemini?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('refinement.config.gemini.temperature', val)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Top P</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.refinement?.config?.gemini?.topP?.toFixed(2) ?? "1.00"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={1} step={0.01}
                            value={settings.refinement?.config?.gemini?.topP ?? 1}
                            onValueChange={(val) => updateLocalSettings('refinement.config.gemini.topP', val)}
                            className="py-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Token Budget</Label>
                        <Input
                          type="number"
                          value={settings.refinement?.config?.gemini?.maxTokens ?? 8192}
                          onChange={(e) => updateLocalSettings('refinement.config.gemini.maxTokens', parseInt(e.target.value))}
                          className="bg-muted/20 border-2 border-transparent h-12 rounded-xl px-4 focus:border-primary transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeRefineTab === 'groq' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={Wand2}
                      title="Groq Refinement"
                      badge={settings.refinement?.defaultService === 'groq' ? "Active Service" : ""}
                      description="Groq-powered dynamic text refinement integration."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Inference Model</Label>
                        <Select
                          value={settings.refinement?.config?.groq?.model || ""}
                          onValueChange={(value) => updateLocalSettings('refinement.config.groq.model', value)}
                        >
                          <SelectTrigger className="bg-muted/20 border-2 border-transparent transition-all rounded-xl h-12 px-4 shadow-sm">
                            <SelectValue placeholder="Select Inference Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2">
                            {refineGroqModels.map((model) => (
                              <SelectItem key={model} value={model} className="rounded-lg m-1">{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Temperature</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.refinement?.config?.groq?.temperature?.toFixed(1) ?? "0.7"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={2} step={0.1}
                            value={settings.refinement?.config?.groq?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('refinement.config.groq.temperature', val)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Top P</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.refinement?.config?.groq?.topP?.toFixed(2) ?? "1.00"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={1} step={0.01}
                            value={settings.refinement?.config?.groq?.topP ?? 1}
                            onValueChange={(val) => updateLocalSettings('refinement.config.groq.topP', val)}
                            className="py-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Token Budget</Label>
                        <Input
                          type="number"
                          value={settings.refinement?.config?.groq?.maxTokens ?? 2048}
                          onChange={(e) => updateLocalSettings('refinement.config.groq.maxTokens', parseInt(e.target.value))}
                          className="bg-muted/20 border-2 border-transparent h-12 rounded-xl px-4 focus:border-primary transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation" className="mt-6 border-t animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Sidebar Navigation */}
              <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r bg-muted/10 p-6 space-y-2 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
                  Validator Providers
                </p>
                <SidebarNavButton
                  type="gemini"
                  name="Gemini"
                  icon={ShieldCheck}
                  isActive={activeValidationTab === 'gemini'}
                  isDefault={settings.validation?.defaultService === 'gemini'}
                  onClick={() => setActiveValidationTab('gemini' as ValidatorType)}
                />
                <SidebarNavButton
                  type="grok"
                  name="Grok"
                  icon={ShieldCheck}
                  isActive={activeValidationTab === 'grok'}
                  isDefault={settings.validation?.defaultService === 'grok'}
                  onClick={() => setActiveValidationTab('grok' as ValidatorType)}
                />
              </div>

              {/* Setting Panes */}
              <div className="flex-1 p-8 bg-background relative overflow-y-auto max-h-[600px] custom-scrollbar">
                {activeValidationTab === 'gemini' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={ShieldCheck}
                      title="Gemini Validation"
                      badge={settings.validation?.defaultService === 'gemini' ? "Active Service" : ""}
                      description="Google-powered advanced report validation integration."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Inference Model</Label>
                        <Select
                          value={settings.validation?.config?.gemini?.model || ""}
                          onValueChange={(value) => updateLocalSettings('validation.config.gemini.model', value)}
                        >
                          <SelectTrigger className="bg-muted/20 border-2 border-transparent transition-all rounded-xl h-12 px-4 shadow-sm">
                            <SelectValue placeholder="Select Inference Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2">
                            {staticGeminiModels.map((model) => (
                              <SelectItem key={model} value={model} className="rounded-lg m-1">{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Temperature</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.validation?.config?.gemini?.temperature?.toFixed(1) ?? "0.7"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={2} step={0.1}
                            value={settings.validation?.config?.gemini?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('validation.config.gemini.temperature', val)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Top P</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.validation?.config?.gemini?.topP?.toFixed(2) ?? "1.00"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={1} step={0.01}
                            value={settings.validation?.config?.gemini?.topP ?? 1}
                            onValueChange={(val) => updateLocalSettings('validation.config.gemini.topP', val)}
                            className="py-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Token Budget</Label>
                        <Input
                          type="number"
                          value={settings.validation?.config?.gemini?.maxTokens ?? 2048}
                          onChange={(e) => updateLocalSettings('validation.config.gemini.maxTokens', parseInt(e.target.value))}
                          className="bg-muted/20 border-2 border-transparent h-12 rounded-xl px-4 focus:border-primary transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeValidationTab === 'grok' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionHeader
                      icon={ShieldCheck}
                      title="Grok Validation"
                      badge={settings.validation?.defaultService === 'grok' ? "Active Service" : ""}
                      description="xAI-powered advanced report validation integration."
                    />
                    <div className="grid gap-8 max-w-2xl">
                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Inference Model</Label>
                        <Select
                          value={settings.validation?.config?.grok?.model || ""}
                          onValueChange={(value) => updateLocalSettings('validation.config.grok.model', value)}
                        >
                          <SelectTrigger className="bg-muted/20 border-2 border-transparent transition-all rounded-xl h-12 px-4 shadow-sm">
                            <SelectValue placeholder="Select Inference Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2">
                            {staticGrokModels.map((model) => (
                              <SelectItem key={model} value={model} className="rounded-lg m-1">{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Temperature</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.validation?.config?.grok?.temperature?.toFixed(1) ?? "0.7"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={2} step={0.1}
                            value={settings.validation?.config?.grok?.temperature ?? 0.7}
                            onValueChange={(val) => updateLocalSettings('validation.config.grok.temperature', val)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold">Top P</Label>
                            <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                              {settings.validation?.config?.grok?.topP?.toFixed(2) ?? "1.00"}
                            </Badge>
                          </div>
                          <Slider
                            min={0} max={1} step={0.01}
                            value={settings.validation?.config?.grok?.topP ?? 1}
                            onValueChange={(val) => updateLocalSettings('validation.config.grok.topP', val)}
                            className="py-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Token Budget</Label>
                        <Input
                          type="number"
                          value={settings.validation?.config?.grok?.maxTokens ?? 1024}
                          onChange={(e) => updateLocalSettings('validation.config.grok.maxTokens', parseInt(e.target.value))}
                          className="bg-muted/20 border-2 border-transparent h-12 rounded-xl px-4 focus:border-primary transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="p-8 space-y-8 animate-in fade-in duration-300">
            <div className="space-y-6">
              <div className="p-8 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/[0.07] transition-colors">
                <SectionHeader icon={Search} title="Parallel AI Intelligence" badge="Consolidated Pipeline" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 items-start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="parallel-model" className="text-sm font-medium">Intelligence Model</Label>
                      <Input
                        id="parallel-model"
                        value={settings.research?.config?.['parallel-ai']?.model || ""}
                        onChange={(e) => updateLocalSettings('research.config.parallel-ai.model', e.target.value)}
                        placeholder="e.g. search-extract-2.0"
                        className="bg-background h-11"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Info className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Powers both Report Insights and WebAssist modules.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parallel-url" className="text-sm font-medium">Gateway Endpoint (URL)</Label>
                    <Input
                      id="parallel-url"
                      value={settings.research?.config?.['parallel-ai']?.baseUrl || ""}
                      onChange={(e) => updateLocalSettings('research.config.parallel-ai.baseUrl', e.target.value)}
                      placeholder="https://api.parallel.ai/v1"
                      className="bg-background h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="embeddings" className="p-8 space-y-8 animate-in fade-in duration-300">
            <div className="space-y-6">
              <div className="p-8 rounded-xl border border-border shadow-md bg-gradient-to-br from-background to-muted/30">
                <SectionHeader icon={Database} title="Voyage AI Vectors" badge="RAG Infrastructure" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 items-start">
                  <div className="space-y-2">
                    <Label htmlFor="voyage-model" className="text-sm font-medium">Embedding Model ID</Label>
                    <Input
                      id="voyage-model"
                      value={settings.embeddings?.config?.['voyage-ai']?.model || ""}
                      onChange={(e) => updateLocalSettings('embeddings.config.voyage-ai.model', e.target.value)}
                      className="bg-background h-11 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voyage-rerank" className="text-sm font-medium">Reranking Model ID</Label>
                    <Input
                      id="voyage-rerank"
                      value={settings.embeddings?.config?.['voyage-ai']?.rerankModel || ""}
                      onChange={(e) => updateLocalSettings('embeddings.config.voyage-ai.rerankModel', e.target.value)}
                      className="bg-background h-11 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-20 w-full border-t bg-background/80 backdrop-blur-md px-8 py-2 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-sm font-medium">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse ring-4 ring-green-500/20" />
          {/* <span className="text-muted-foreground italic">Stage changes locally before synchronization.</span> */}
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none h-11 px-8 font-bold hover:bg-muted/50 rounded-xl transition-all"
            onClick={() => window.location.reload()}
          >
            Revert Sync
          </Button>
          <Button
            onClick={saveSettings}
            disabled={isUpdating}
            className="flex-1 sm:flex-none min-w-[220px] h-11 rounded-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold bg-zinc-900 text-white hover:bg-zinc-800 border-2 border-zinc-700/50"
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Synchronize
          </Button>
        </div>
      </div>
    </Card>
  );
}; 
