import { MessagePrimitive } from "@assistant-ui/react";

const MyUserMessage = () => (
  <MessagePrimitive.Root className="grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 py-4">
    <div className="bg-muted text-foreground col-start-2 row-start-1 max-w-xl break-words rounded-3xl px-5 py-2.5">
      <MessagePrimitive.Content />
    </div>
  </MessagePrimitive.Root>
);

export default MyUserMessage;
