import type { AttachmentData } from "@repo/elements/attachments";
import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@repo/elements/attachments";
import { CodeBlock } from "@repo/elements/code-block";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@repo/elements/context";
import { Conversation, ConversationContent } from "@repo/elements/conversation";
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@repo/elements/file-tree";
import { Message, MessageContent } from "@repo/elements/message";
import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "@repo/elements/plan";
import type { PromptInputMessage } from "@repo/elements/prompt-input";
import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputHoverCard,
  PromptInputHoverCardContent,
  PromptInputHoverCardTrigger,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@repo/elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@repo/elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@repo/elements/sources";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@repo/elements/tool";
import { Badge } from "@repo/shadcn-ui/components/ui/badge";
import { Button } from "@repo/shadcn-ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/shadcn-ui/components/ui/dropdown-menu";
import { Progress } from "@repo/shadcn-ui/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/components/ui/select";
import { Slider } from "@repo/shadcn-ui/components/ui/slider";
import { Toaster } from "@repo/shadcn-ui/components/ui/toaster";
import { toast } from "@repo/shadcn-ui/hooks/use-toast";
import {
  AtSignIcon,
  BotIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  FilesIcon,
  GlobeIcon,
  ImageIcon,
  RulerIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const checks = [
  "AI conversation renders user and assistant messages",
  "Model Select opens a Base UI positioned popup",
  "Toast appears in the top-right notification stack",
  "Slider and Progress share the same live value",
  "Dropdown callbacks update the visible action state",
  "PromptInput demonstrates text, files, context, tools, modes, and submit state",
] as const;

const modelOptions = [
  {
    description: "Balanced reasoning model for agent workflows",
    label: "GPT-5.1 Reasoning",
    value: "gpt-5.1",
  },
  {
    description: "Fast assistant model for UI smoke checks",
    label: "Claude Sonnet 4.5",
    value: "claude-sonnet-4.5",
  },
  {
    description: "Multimodal model for preview screenshots",
    label: "Gemini 3 Pro",
    value: "gemini-3-pro",
  },
  {
    description: "Local fallback used for offline acceptance",
    label: "Local sandbox model",
    value: "local-sandbox",
  },
] as const;

const promptModeOptions = [
  {
    description: "Normal chat turn with context and tools",
    label: "Chat",
    value: "chat",
  },
  {
    description: "Patch or rewrite selected content",
    label: "Edit",
    value: "edit",
  },
  {
    description: "Plan tasks and execute tool calls",
    label: "Agent",
    value: "agent",
  },
  {
    description: "Dictation-oriented voice prompt",
    label: "Voice",
    value: "voice",
  },
] as const;

const registryExamples = [
  {
    label: "Registry index",
    url: "https://wenerme.github.io/ai-elements/registry.json",
  },
  {
    label: "Prompt Input item",
    url: "https://wenerme.github.io/ai-elements/r/prompt-input.json",
  },
  {
    label: "Rich prompt example",
    url: "https://wenerme.github.io/ai-elements/r/example-prompt-input-cursor.json",
  },
] as const;

const MAX_CONTEXT_TOKENS = 128_000;
const BASE_INPUT_TOKENS = 18_400;
const CACHED_INPUT_TOKENS = 8200;
const CONTEXT_ITEM_TOKEN_ESTIMATE = 1600;
const CHARACTERS_PER_TOKEN_ESTIMATE = 4;
const OUTPUT_TOKEN_ESTIMATE = 3200;
const REASONING_TOKEN_ESTIMATE = 2400;
const PROMPT_SUBMITTED_DELAY_MS = 400;
const PROMPT_COMPLETED_DELAY_MS = 1600;
const PROMPT_ERROR_RESET_DELAY_MS = 1200;

type PromptSubmitStatus = "ready" | "submitted" | "streaming" | "error";

const createPreviewImageDataUrl = (label: string, accentColor: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200" role="img" aria-label="${label}"><rect width="320" height="200" rx="24" fill="#09090b"/><rect x="24" y="24" width="272" height="152" rx="18" fill="${accentColor}" opacity="0.18"/><circle cx="64" cy="64" r="18" fill="${accentColor}"/><rect x="96" y="50" width="160" height="14" rx="7" fill="#fafafa" opacity="0.86"/><rect x="48" y="108" width="224" height="12" rx="6" fill="#fafafa" opacity="0.58"/><rect x="48" y="132" width="152" height="12" rx="6" fill="#fafafa" opacity="0.36"/><text x="48" y="166" fill="#fafafa" font-family="ui-sans-serif, system-ui" font-size="18" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const previewScreenshotUrl = createPreviewImageDataUrl(
  "Preview Screenshot",
  "#38bdf8"
);
const designReviewImageUrl = createPreviewImageDataUrl(
  "Design Review",
  "#a78bfa"
);
const interactivePreviewImageUrl = createPreviewImageDataUrl(
  "Interactive Preview",
  "#34d399"
);

const richPromptAttachments: AttachmentData[] = [
  {
    filename: "preview-screenshot.png",
    id: "preview-screenshot",
    mediaType: "image/png",
    type: "file",
    url: previewScreenshotUrl,
  },
  {
    filename: "acceptance-notes.md",
    id: "acceptance-notes",
    mediaType: "text/markdown",
    type: "file",
    url: "#acceptance-notes",
  },
  {
    filename: "packages/elements/src/prompt-input.tsx",
    id: "prompt-input-source",
    mediaType: "text/plain",
    sourceId: "prompt-input-source",
    title: "prompt-input.tsx",
    type: "source-document",
  },
];

const demoPatchCode = `type AgentDemoState = {
  model: string;
  mode: "agent" | "chat" | "edit" | "voice";
  contextFiles: string[];
  tools: Array<"read_registry" | "inspect_bundle" | "run_smoke">;
};

export const buildAcceptanceSummary = (state: AgentDemoState) => ({
  title: "Base UI registry preview",
  verified: true,
  model: state.model,
  context: state.contextFiles,
  nextAction: "ship-gh-pages-preview",
});`;

const getRichPromptContextLabel = (attachment: AttachmentData): string => {
  if (attachment.type === "source-document") {
    return attachment.title || attachment.filename || "Source";
  }
  return attachment.filename || "Attachment";
};

const formatNow = () =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

const Section = ({
  children,
  className,
  description,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  description: string;
  title: string;
}) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export const PreviewApp = () => {
  const [selectedModel, setSelectedModel] = useState("gpt-5.1");
  const [promptMode, setPromptMode] = useState("agent");
  const [sliderValue, setSliderValue] = useState([42]);
  const [progressValue, setProgressValue] = useState(42);
  const [dropdownAction, setDropdownAction] = useState("No action yet");
  const [submittedPrompt, setSubmittedPrompt] = useState(
    "No prompt submitted yet"
  );
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [reasoningEnabled, setReasoningEnabled] = useState(true);
  const [promptInputAction, setPromptInputAction] = useState(
    "Ready with text, attachments, context, tools, modes, and submit state"
  );
  const [promptText, setPromptText] = useState(
    "Validate the registry install flow and summarize any Base UI interaction regressions."
  );
  const [richPromptContext, setRichPromptContext] = useState(
    richPromptAttachments
  );
  const [promptSubmitStatus, setPromptSubmitStatus] =
    useState<PromptSubmitStatus>("ready");
  const [promptTurnCount, setPromptTurnCount] = useState(0);
  const [lastPromptSummary, setLastPromptSummary] = useState(
    "No live prompt turn yet"
  );
  const [demoSelectedFile, setDemoSelectedFile] = useState(
    "apps/preview/src/preview-app.tsx"
  );
  const promptStatusTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      for (const timer of promptStatusTimers.current) {
        clearTimeout(timer);
      }
    },
    []
  );

  const selectedModelOption =
    modelOptions.find((option) => option.value === selectedModel) ??
    modelOptions[0];
  const promptModeOption =
    promptModeOptions.find((option) => option.value === promptMode) ??
    promptModeOptions[0];

  const contextInputTokens =
    BASE_INPUT_TOKENS +
    richPromptContext.length * CONTEXT_ITEM_TOKEN_ESTIMATE +
    Math.ceil(promptText.length / CHARACTERS_PER_TOKEN_ESTIMATE);
  const contextReasoningTokens = reasoningEnabled
    ? REASONING_TOKEN_ESTIMATE
    : 0;
  const usedContextTokens =
    contextInputTokens + OUTPUT_TOKEN_ESTIMATE + contextReasoningTokens;

  const addRichPromptContext = useCallback((attachment: AttachmentData) => {
    setRichPromptContext((current) => {
      if (current.some((item) => item.id === attachment.id)) {
        return current;
      }
      return [...current, attachment];
    });
    setPromptInputAction(`Added ${getRichPromptContextLabel(attachment)}`);
  }, []);

  const removeRichPromptContext = useCallback((id: string) => {
    setRichPromptContext((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) {
        setPromptInputAction(`Removed ${getRichPromptContextLabel(removed)}`);
      }
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const clearPromptStatusTimers = useCallback(() => {
    for (const timer of promptStatusTimers.current) {
      clearTimeout(timer);
    }
    promptStatusTimers.current = [];
  }, []);

  const handleRichPromptSubmit = useCallback(
    ({ files, text }: PromptInputMessage) => {
      const trimmedText = text.trim();
      const fallback = richPromptContext.length
        ? `Submitted with ${richPromptContext.length} context item(s)`
        : "Submitted empty prompt";
      const promptSummary = trimmedText || fallback;

      clearPromptStatusTimers();
      setSubmittedPrompt(promptSummary);
      setPromptText("");
      setPromptTurnCount((count) => count + 1);
      setPromptSubmitStatus("submitted");
      setPromptInputAction(
        `Queued ${promptModeOption.label} prompt for ${selectedModelOption.label}`
      );
      setLastPromptSummary(
        `${promptModeOption.label} · ${richPromptContext.length} context item(s) · ${files.length} uploaded file(s)`
      );

      promptStatusTimers.current = [
        setTimeout(() => {
          setPromptSubmitStatus("streaming");
          setPromptInputAction(
            `${selectedModelOption.label} is streaming a preview response`
          );
        }, PROMPT_SUBMITTED_DELAY_MS),
        setTimeout(() => {
          setPromptSubmitStatus("ready");
          setPromptInputAction(
            `Completed ${promptModeOption.label} prompt with ${selectedModelOption.label}`
          );
        }, PROMPT_COMPLETED_DELAY_MS),
      ];

      toast({
        description: `${promptModeOption.label} mode · ${richPromptContext.length} context item(s)`,
        title: "Prompt submitted",
      });
    },
    [
      clearPromptStatusTimers,
      promptModeOption.label,
      richPromptContext.length,
      selectedModelOption.label,
    ]
  );

  const stopRichPrompt = useCallback(() => {
    clearPromptStatusTimers();
    setPromptSubmitStatus("ready");
    setPromptInputAction("Stopped streaming preview response");
  }, [clearPromptStatusTimers]);

  const markRichPromptError = useCallback(() => {
    clearPromptStatusTimers();
    setPromptSubmitStatus("error");
    setPromptInputAction("Simulated prompt validation error");
    promptStatusTimers.current = [
      setTimeout(() => {
        setPromptSubmitStatus("ready");
      }, PROMPT_ERROR_RESET_DELAY_MS),
    ];
  }, [clearPromptStatusTimers]);

  const toggleWebSearch = useCallback(() => {
    setWebSearchEnabled((value) => {
      const nextValue = !value;
      setPromptInputAction(`Web search ${nextValue ? "enabled" : "disabled"}`);
      return nextValue;
    });
  }, []);

  const toggleReasoning = useCallback(() => {
    setReasoningEnabled((value) => {
      const nextValue = !value;
      setPromptInputAction(`Reasoning ${nextValue ? "enabled" : "disabled"}`);
      return nextValue;
    });
  }, []);

  const status = useMemo(
    () => ({
      dropdownAction,
      progressValue,
      promptInputAction,
      promptMode,
      promptModeLabel: promptModeOption.label,
      promptSubmitStatus,
      promptTextLength: promptText.length,
      promptTurnCount,
      reasoningEnabled,
      richPromptContext: richPromptContext.map(getRichPromptContextLabel),
      selectedModel,
      selectedModelLabel: selectedModelOption.label,
      sliderValue: sliderValue[0] ?? 0,
      submittedPrompt,
      usedContextTokens,
      webSearchEnabled,
    }),
    [
      dropdownAction,
      progressValue,
      promptInputAction,
      promptMode,
      promptModeOption.label,
      promptSubmitStatus,
      promptText.length,
      promptTurnCount,
      reasoningEnabled,
      richPromptContext,
      selectedModel,
      selectedModelOption.label,
      sliderValue,
      submittedPrompt,
      usedContextTokens,
      webSearchEnabled,
    ]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Toaster />
      <header className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit gap-1.5" variant="secondary">
              <SparklesIcon className="size-3.5" />
              AI Elements Preview
            </Badge>
            <div>
              <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
                AI Elements Base UI Migration Acceptance
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Static GitHub Pages preview for real AI building blocks:
                conversation, messages, model select, prompt input, toast, and
                interaction primitives.
              </p>
            </div>
          </div>
          <Button
            className="w-fit"
            onClick={() =>
              toast({
                description: `Preview toast fired at ${formatNow()}`,
                title: "AI preview toast works",
              })
            }
          >
            Trigger Toast
          </Button>
        </div>

        <ul className="grid gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm md:grid-cols-2">
          {checks.map((check) => (
            <li
              className="grid grid-cols-[1rem_1fr] items-start gap-2 text-sm leading-6"
              key={check}
            >
              <CheckCircle2Icon className="mt-1 size-4 text-primary" />
              <span>{check}</span>
            </li>
          ))}
        </ul>
      </header>

      <Section
        description="Static shadcn registry files are generated into this GitHub Pages site during preview builds."
        title="Registry Usage"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-3">
            <p className="text-sm leading-6">
              Use this Pages deployment as a shadcn registry host. The registry
              index and individual item JSON files are served as static assets,
              so they work without a Next.js API route.
            </p>
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
              npx shadcn@latest add
              https://wenerme.github.io/ai-elements/r/prompt-input.json
            </pre>
          </div>
          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            {registryExamples.map((example) => (
              <a
                className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                href={example.url}
                key={example.url}
              >
                <span className="block font-medium">{example.label}</span>
                <span className="block truncate text-muted-foreground text-xs">
                  {example.url}
                </span>
              </a>
            ))}
          </div>
        </div>
      </Section>

      <Section
        description="A complete agent run with user prompt, reasoning, tools, file context, generated code, sources, and the live PromptInput state below."
        title="Complete Agent Demo"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Conversation className="h-[720px] rounded-xl border bg-background">
            <ConversationContent className="gap-5 p-4">
              <Message from="user">
                <MessageContent className="max-w-full">
                  <div className="space-y-3">
                    <p>
                      Build a production-ready shadcn registry preview for AI
                      Elements. Validate the live Pages site, inspect registry
                      JSON, show the code shape, and prove the prompt composer
                      works like an agent UI.
                    </p>
                    <Attachments variant="inline">
                      {richPromptContext.slice(0, 3).map((attachment) => (
                        <Attachment data={attachment} key={attachment.id}>
                          <AttachmentPreview />
                          <AttachmentInfo />
                        </Attachment>
                      ))}
                    </Attachments>
                  </div>
                </MessageContent>
              </Message>

              <Message from="assistant">
                <MessageContent className="max-w-full space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <BotIcon className="size-3.5" />
                    <span>{selectedModelOption.label}</span>
                    <span>·</span>
                    <span>{promptModeOption.label} mode</span>
                    <span>·</span>
                    <span>{promptSubmitStatus}</span>
                  </div>

                  <Reasoning
                    defaultOpen
                    duration={7}
                    isStreaming={promptSubmitStatus === "streaming"}
                  >
                    <ReasoningTrigger />
                    <ReasoningContent>
                      {`I need to verify this as a real agent workflow, not just isolated widgets.

Plan:
1. Inspect the static registry endpoints and recursive shadcn dependencies.
2. Check the files involved in the preview and generated registry.
3. Run a smoke test against the prompt composer interaction state.
4. Summarize the code and deployment evidence in one conversation turn.`}
                    </ReasoningContent>
                  </Reasoning>

                  <Plan
                    defaultOpen
                    isStreaming={promptSubmitStatus !== "ready"}
                  >
                    <PlanHeader>
                      <div>
                        <PlanTitle>Registry acceptance plan</PlanTitle>
                        <PlanDescription>
                          End-to-end validation for Pages, registry install,
                          prompt composer, and Base UI primitives.
                        </PlanDescription>
                      </div>
                      <PlanTrigger />
                    </PlanHeader>
                    <PlanContent>
                      <ol className="list-decimal space-y-1 pl-4 text-sm">
                        <li>
                          Read `/registry.json` and selected `/r/*.json` items.
                        </li>
                        <li>
                          Install `prompt-input` with `shadcn add --dry-run`.
                        </li>
                        <li>
                          Exercise context chips, tool toggles, and submit
                          status.
                        </li>
                        <li>Report code, file, and deployment evidence.</li>
                      </ol>
                    </PlanContent>
                  </Plan>

                  <Tool defaultOpen>
                    <ToolHeader
                      state="output-available"
                      title="Read static registry"
                      type="tool-readRegistry"
                    />
                    <ToolContent>
                      <ToolInput
                        input={{
                          endpoints: [
                            "/registry.json",
                            "/r/prompt-input.json",
                            "/api/registry/prompt-input.json",
                          ],
                          host: "https://wenerme.github.io/ai-elements",
                        }}
                      />
                      <ToolOutput
                        errorText={undefined}
                        output={{
                          dependencies: ["@base-ui/react", "cmdk", "ai"],
                          items: 198,
                          radix: false,
                          status: "ok",
                        }}
                      />
                    </ToolContent>
                  </Tool>

                  <Tool defaultOpen>
                    <ToolHeader
                      state="output-available"
                      title="Run composer smoke"
                      type="tool-runSmoke"
                    />
                    <ToolContent>
                      <ToolInput
                        input={{
                          addContextChip: "interactive-preview.png",
                          prompt: submittedPrompt,
                          toggleTools: ["search", "reason"],
                        }}
                      />
                      <ToolOutput
                        errorText={undefined}
                        output={{
                          contextChips: richPromptContext.length,
                          promptTurnCount,
                          status: promptSubmitStatus,
                          textCleared: promptText.length === 0,
                        }}
                      />
                    </ToolContent>
                  </Tool>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Workspace files</p>
                      <FileTree
                        defaultExpanded={
                          new Set([
                            "apps",
                            "apps/preview",
                            "packages",
                            "packages/scripts",
                          ])
                        }
                        onSelect={setDemoSelectedFile}
                        selectedPath={demoSelectedFile}
                      >
                        <FileTreeFolder name="apps" path="apps">
                          <FileTreeFolder name="preview" path="apps/preview">
                            <FileTreeFile
                              name="preview-app.tsx"
                              path="apps/preview/src/preview-app.tsx"
                            />
                            <FileTreeFile
                              name="package.json"
                              path="apps/preview/package.json"
                            />
                          </FileTreeFolder>
                        </FileTreeFolder>
                        <FileTreeFolder name="packages" path="packages">
                          <FileTreeFile
                            name="prompt-input.tsx"
                            path="packages/elements/src/prompt-input.tsx"
                          />
                          <FileTreeFolder
                            name="scripts"
                            path="packages/scripts"
                          >
                            <FileTreeFile
                              name="generate-static-registry.ts"
                              path="packages/scripts/src/generate-static-registry.ts"
                            />
                          </FileTreeFolder>
                        </FileTreeFolder>
                      </FileTree>
                      <p className="text-muted-foreground text-xs">
                        Selected: <span>{demoSelectedFile}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-sm">
                        Generated code result
                      </p>
                      <CodeBlock
                        className="max-h-80"
                        code={demoPatchCode}
                        language="tsx"
                        showLineNumbers
                      />
                    </div>
                  </div>

                  <Sources defaultOpen>
                    <SourcesTrigger count={3} />
                    <SourcesContent>
                      <Source
                        href="https://wenerme.github.io/ai-elements/registry.json"
                        title="Live registry index"
                      />
                      <Source
                        href="https://wenerme.github.io/ai-elements/r/prompt-input.json"
                        title="Prompt Input registry item"
                      />
                      <Source
                        href="https://github.com/wenerme/ai-elements/actions"
                        title="GitHub Actions checks"
                      />
                    </SourcesContent>
                  </Sources>

                  <div className="rounded-lg border bg-muted/40 p-3 text-sm leading-6">
                    <p className="font-medium">Final answer</p>
                    <p>
                      The registry preview is live, Base UI-backed, and
                      installable. The prompt composer below drives this demo:
                      submitting a prompt updates the user turn, reasoning/tool
                      status, context tokens, and smoke-test output without a
                      page reload.
                    </p>
                  </div>
                </MessageContent>
              </Message>

              <Message from="user">
                <MessageContent>
                  {submittedPrompt === "No prompt submitted yet"
                    ? "Try the composer below: add a context chip, toggle tools, then submit a prompt."
                    : submittedPrompt}
                </MessageContent>
              </Message>
            </ConversationContent>
          </Conversation>

          <div className="space-y-4 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center gap-2 font-medium text-sm">
              <UserIcon className="size-4" />
              Demo state
            </div>
            <Attachments variant="list">
              {richPromptContext.map((attachment) => (
                <Attachment data={attachment} key={attachment.id}>
                  <AttachmentPreview />
                  <AttachmentInfo />
                </Attachment>
              ))}
            </Attachments>
            <div className="grid gap-2 text-muted-foreground text-xs leading-5">
              <p>
                Model: <span>{selectedModelOption.label}</span>
              </p>
              <p>
                Mode: <span>{promptModeOption.label}</span>
              </p>
              <p>
                Prompt status: <span>{promptSubmitStatus}</span>
              </p>
              <p>
                Context tokens:{" "}
                <span>{usedContextTokens.toLocaleString()}</span>
              </p>
              <p>
                Last turn: <span>{lastPromptSummary}</span>
              </p>
            </div>
          </div>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          description="Open the popup, choose another AI model, then verify the conversation and status panel update."
          title="Model Select"
        >
          <Select onValueChange={setSelectedModel} value={selectedModel}>
            <SelectTrigger className="w-full" aria-label="Choose AI model">
              <SelectValue placeholder="Choose an AI model">
                {(value) =>
                  modelOptions.find((option) => option.value === value)
                    ?.label ?? "Choose an AI model"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start" className="w-[var(--anchor-width)]">
              {modelOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  label={option.label}
                  value={option.value}
                >
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="truncate">{option.label}</span>
                    <span className="truncate text-muted-foreground text-xs">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-3 text-muted-foreground text-sm">
            Current model: <span>{selectedModelOption.label}</span>
          </p>
        </Section>

        <Section
          description="Drag the thumb; progress should track the slider value."
          title="Slider + Progress"
        >
          <div className="space-y-5">
            <Slider
              aria-label="Preview progress"
              max={100}
              min={0}
              onValueChange={(value) => {
                setSliderValue(value);
                setProgressValue(value[0] ?? 0);
              }}
              value={sliderValue}
            />
            <Progress value={progressValue} />
            <p className="text-muted-foreground text-sm">
              Current value: {progressValue}%
            </p>
          </div>
        </Section>

        <Section
          description="Menu item selection exercises composed handlers and onSelect compatibility."
          title="Dropdown Menu"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Open actions <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Assistant actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDropdownAction("Inspect selected")}
              >
                Inspect response
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setDropdownAction("Approve selected")}
              >
                Approve answer
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setDropdownAction("Retry selected")}
              >
                Retry generation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="mt-4 text-muted-foreground text-sm">
            Last dropdown action: <span>{dropdownAction}</span>
          </p>
        </Section>

        <Section
          className="lg:col-span-2"
          description="Rich composer covering text, file chips, referenced sources, tools, context usage, prompt modes, and submit state."
          title="Rich Prompt Input"
        >
          <PromptInput
            globalDrop
            multiple
            onError={(error) => {
              setPromptInputAction(error.message);
              markRichPromptError();
            }}
            onSubmit={handleRichPromptSubmit}
          >
            <PromptInputHeader>
              <Attachments className="w-full" variant="inline">
                {richPromptContext.map((attachment) => (
                  <Attachment
                    data={attachment}
                    key={attachment.id}
                    onRemove={() => removeRichPromptContext(attachment.id)}
                  >
                    <AttachmentPreview />
                    <AttachmentInfo />
                    <AttachmentRemove />
                  </Attachment>
                ))}
              </Attachments>
              <PromptInputHoverCard>
                <PromptInputHoverCardTrigger>
                  <PromptInputButton
                    aria-label="Open referenced files"
                    size="sm"
                    variant="outline"
                  >
                    <AtSignIcon className="size-3.5" />
                    Files
                  </PromptInputButton>
                </PromptInputHoverCardTrigger>
                <PromptInputHoverCardContent className="w-80 space-y-3 p-3">
                  <div>
                    <p className="font-medium text-sm">Referenced files</p>
                    <p className="text-muted-foreground text-xs">
                      {richPromptContext.length} active context item(s). Add or
                      remove chips to see the composer state update.
                    </p>
                  </div>
                  <div className="space-y-1 text-sm">
                    {richPromptContext.map((attachment) => (
                      <p key={attachment.id}>
                        {getRichPromptContextLabel(attachment)}
                      </p>
                    ))}
                  </div>
                </PromptInputHoverCardContent>
              </PromptInputHoverCard>
              <PromptInputHoverCard>
                <PromptInputHoverCardTrigger>
                  <PromptInputButton size="sm" variant="outline">
                    <RulerIcon className="size-3.5" />
                    Rules
                  </PromptInputButton>
                </PromptInputHoverCardTrigger>
                <PromptInputHoverCardContent className="w-72 p-0">
                  <div className="space-y-2 p-3">
                    <p className="font-medium text-sm">Attached rules</p>
                    <p className="text-muted-foreground text-sm">
                      Keep Base UI compatibility, validate gh-pages, and avoid
                      direct Radix imports.
                    </p>
                  </div>
                  <p className="border-t bg-muted px-3 py-2 text-muted-foreground text-xs">
                    Rule chips are part of PromptInput header composition.
                  </p>
                </PromptInputHoverCardContent>
              </PromptInputHoverCard>
              <PromptInputHoverCard>
                <PromptInputHoverCardTrigger>
                  <PromptInputButton size="sm" variant="outline">
                    <FilesIcon className="size-3.5" />3 Tabs
                  </PromptInputButton>
                </PromptInputHoverCardTrigger>
                <PromptInputHoverCardContent className="w-80 space-y-3 p-3">
                  <p className="font-medium text-sm">Active browser tabs</p>
                  <div className="space-y-2 text-sm">
                    <p className="truncate">GitHub Pages preview</p>
                    <p className="truncate">Base UI Select adapter</p>
                    <p className="truncate">PromptInput documentation</p>
                  </div>
                </PromptInputHoverCardContent>
              </PromptInputHoverCard>
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
                name="message"
                onChange={(event) => setPromptText(event.currentTarget.value)}
                placeholder="Ask, edit, search, or attach context for the preview assistant..."
                value={promptText}
              />
            </PromptInputBody>

            <PromptInputFooter className="flex-wrap">
              <PromptInputTools className="flex-wrap">
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger
                    aria-label="Open prompt actions"
                    tooltip="Add input"
                  />
                  <PromptInputActionMenuContent>
                    <PromptInputActionMenuItem
                      onSelect={() =>
                        addRichPromptContext({
                          filename: "design-review.png",
                          id: "design-review",
                          mediaType: "image/png",
                          type: "file",
                          url: designReviewImageUrl,
                        })
                      }
                    >
                      <ImageIcon className="mr-2 size-4" />
                      Add image or file
                    </PromptInputActionMenuItem>
                    <PromptInputActionMenuItem
                      onSelect={() =>
                        addRichPromptContext({
                          filename: "interactive-preview.png",
                          id: "interactive-preview",
                          mediaType: "image/png",
                          type: "file",
                          url: interactivePreviewImageUrl,
                        })
                      }
                    >
                      <FilesIcon className="mr-2 size-4" />
                      Attach screenshot
                    </PromptInputActionMenuItem>
                    <PromptInputActionMenuItem
                      onSelect={() =>
                        addRichPromptContext({
                          filename: "packages/elements/src/prompt-input.tsx",
                          id: "prompt-input-live-source",
                          mediaType: "text/plain",
                          sourceId: "prompt-input-live-source",
                          title: "prompt-input.tsx live source",
                          type: "source-document",
                        })
                      }
                    >
                      <AtSignIcon className="mr-2 size-4" />
                      Reference source
                    </PromptInputActionMenuItem>
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <PromptInputButton
                  aria-pressed={webSearchEnabled}
                  onClick={toggleWebSearch}
                  tooltip="Toggle web search"
                >
                  <GlobeIcon className="size-4" />
                  Search
                </PromptInputButton>

                <PromptInputButton
                  aria-pressed={reasoningEnabled}
                  onClick={toggleReasoning}
                  tooltip="Toggle reasoning"
                >
                  <SparklesIcon className="size-4" />
                  Reason
                </PromptInputButton>

                <PromptInputSelect
                  onValueChange={setPromptMode}
                  value={promptMode}
                >
                  <PromptInputSelectTrigger aria-label="Choose prompt mode">
                    <PromptInputSelectValue>
                      {(value) =>
                        promptModeOptions.find(
                          (option) => option.value === value
                        )?.label ?? "Mode"
                      }
                    </PromptInputSelectValue>
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {promptModeOptions.map((option) => (
                      <PromptInputSelectItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      >
                        <div className="flex flex-col text-left">
                          <span>{option.label}</span>
                          <span className="text-muted-foreground text-xs">
                            {option.description}
                          </span>
                        </div>
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>

                <Context
                  maxTokens={MAX_CONTEXT_TOKENS}
                  modelId={selectedModel}
                  usage={{
                    cachedInputTokens: CACHED_INPUT_TOKENS,
                    inputTokens: contextInputTokens,
                    outputTokens: OUTPUT_TOKEN_ESTIMATE,
                    reasoningTokens: contextReasoningTokens,
                    totalTokens: usedContextTokens,
                  }}
                  usedTokens={usedContextTokens}
                >
                  <ContextTrigger className="h-8" />
                  <ContextContent>
                    <ContextContentHeader />
                    <ContextContentBody className="space-y-2">
                      <ContextInputUsage />
                      <ContextCacheUsage />
                      <ContextReasoningUsage />
                      <ContextOutputUsage />
                    </ContextContentBody>
                    <ContextContentFooter />
                  </ContextContent>
                </Context>
              </PromptInputTools>

              <PromptInputSubmit
                aria-label="Submit acceptance note"
                disabled={promptSubmitStatus === "submitted"}
                onStop={stopRichPrompt}
                status={promptSubmitStatus}
              />
            </PromptInputFooter>
          </PromptInput>
          <div className="mt-4 grid gap-2 text-muted-foreground text-sm sm:grid-cols-2">
            <p>
              Submit status: <span>{promptSubmitStatus}</span> · Turns:{" "}
              <span>{promptTurnCount}</span>
            </p>
            <p>
              Context chips: <span>{richPromptContext.length}</span> · Tokens:{" "}
              <span>{usedContextTokens.toLocaleString()}</span>
            </p>
            <p>
              Prompt mode: <span>{promptModeOption.label}</span>
            </p>
            <p>
              Web search: <span>{webSearchEnabled ? "on" : "off"}</span> ·
              Reasoning: <span>{reasoningEnabled ? "on" : "off"}</span>
            </p>
            <p className="sm:col-span-2">
              Last prompt action: <span>{promptInputAction}</span>
            </p>
            <p className="sm:col-span-2">
              Last submitted prompt: <span>{submittedPrompt}</span>
            </p>
          </div>
        </Section>
      </div>

      <Section
        description="Use this panel for quick screenshot evidence during manual acceptance."
        title="Live Status"
      >
        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
          {JSON.stringify(status, null, 2)}
        </pre>
      </Section>
    </main>
  );
};
