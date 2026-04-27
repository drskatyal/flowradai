import { Mic } from "../mic";
import { Separator } from "@/components/ui/separator";
import { Editor } from "@tiptap/react";
import { useTranscription } from "./hooks/use-transcription";
import SonioxSpeechToText from "../mic/soniox-mic";
import getAPIKey from "@/lib/utils";
import { useState } from "react";

type Props = {
  editor: Editor;
  onMicStop?: (text: string) => void; // ✅ new optional callback
};

const RichTextEditorTranscription = ({ editor, onMicStop }: Props) => {
  const { autoRefine, setAutoRefine, handleTranscriptionComplete, resetTranscription } = useTranscription({ editor });
  const modelOptions = ["Transcription v2.0-Fastest", "Transcription v1.0"];
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);

  return (
    <div className="flex items-center gap-1 md:gap-2 pr-1">
      <Separator orientation="vertical" className="h-full" />
      {selectedModel === modelOptions[0] && (
        // ✅ Soniox
        <SonioxSpeechToText
          onTranscription={(transcript) => { handleTranscriptionComplete(transcript); }}
          onModelSelect={(m: string) => setSelectedModel(m)}
          apiKey={getAPIKey}
          size={33.33}
          enableShortcuts={false}
          isEditor={true}
          enableModelSwitching={true}
        />
      )}

      {selectedModel === modelOptions[1] && (
        // ✅ VAD Mic
        <Mic
          key={"auto-refine-" + autoRefine}
          onTranscription={handleTranscriptionComplete}
          onModelSelect={(m: string) => setSelectedModel(m)}
          tooltipLabel="Record Findings"
          autoRefineCheck={autoRefine}
          enableModelSwitching={true}
          enableShortcuts={false}
          size={33.33}
          isEditor={true}
        />
      )}
    </div>
  );
};

export default RichTextEditorTranscription;
