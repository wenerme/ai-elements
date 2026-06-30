import { Attachments, Attachment } from "@repo/elements/attachments";
import { Conversation, ConversationContent } from "@repo/elements/conversation";
import { Message, MessageContent } from "@repo/elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@repo/elements/prompt-input";
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
  BotIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  SendIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

const checks = [
  "AI conversation renders user and assistant messages",
  "Model Select opens a Base UI positioned popup",
  "Toast appears in the top-right notification stack",
  "Slider and Progress share the same live value",
  "Dropdown callbacks update the visible action state",
  "PromptInput submits into the conversation status panel",
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

const formatNow = () =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

const Section = ({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export const PreviewApp = () => {
  const [selectedModel, setSelectedModel] = useState("gpt-5.1");
  const [sliderValue, setSliderValue] = useState([42]);
  const [progressValue, setProgressValue] = useState(42);
  const [dropdownAction, setDropdownAction] = useState("No action yet");
  const [submittedPrompt, setSubmittedPrompt] = useState(
    "No prompt submitted yet"
  );

  const selectedModelOption =
    modelOptions.find((option) => option.value === selectedModel) ??
    modelOptions[0];

  const status = useMemo(
    () => ({
      dropdownAction,
      progressValue,
      selectedModel,
      selectedModelLabel: selectedModelOption.label,
      sliderValue: sliderValue[0] ?? 0,
      submittedPrompt,
    }),
    [
      dropdownAction,
      progressValue,
      selectedModel,
      selectedModelOption.label,
      sliderValue,
      submittedPrompt,
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
        description="A real AI Elements composition using Conversation, Message, Attachments, and PromptInput."
        title="AI Conversation"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <Conversation className="h-[430px] rounded-xl border bg-background">
            <ConversationContent className="gap-5 p-4">
              <Message from="user">
                <MessageContent>
                  Validate the Base UI migration on GitHub Pages and make sure
                  the AI chat primitives still feel like a real assistant UI.
                </MessageContent>
              </Message>
              <Message from="assistant">
                <MessageContent className="max-w-full">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
                    <BotIcon className="size-3.5" />
                    <span>{selectedModelOption.label}</span>
                  </div>
                  <div className="space-y-3 leading-6">
                    <p>
                      The preview now renders an AI conversation, not just
                      isolated primitive cards.
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        <strong>Conversation</strong> keeps messages in a
                        scrollable chat surface.
                      </li>
                      <li>
                        <strong>Message</strong> renders assistant and user
                        bubbles.
                      </li>
                      <li>
                        <strong>PromptInput</strong> submits notes into the live
                        status panel.
                      </li>
                      <li>
                        <strong>Model Select</strong> uses Base UI positioning
                        for AI model choices.
                      </li>
                    </ul>
                  </div>
                </MessageContent>
              </Message>
              <Message from="user">
                <MessageContent>
                  Which model is currently selected for this acceptance run?
                </MessageContent>
              </Message>
              <Message from="assistant">
                <MessageContent className="max-w-full">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
                    <BotIcon className="size-3.5" />
                    <span>Model route</span>
                  </div>
                  <div className="space-y-2 leading-6">
                    <p>
                      Selected model:{" "}
                      <strong>{selectedModelOption.label}</strong>
                    </p>
                    <p>{selectedModelOption.description}.</p>
                  </div>
                </MessageContent>
              </Message>
            </ConversationContent>
          </Conversation>

          <div className="space-y-4 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center gap-2 font-medium text-sm">
              <UserIcon className="size-4" />
              Acceptance artifacts
            </div>
            <Attachments variant="list">
              <Attachment
                data={{
                  filename: "base-ui-preview.md",
                  id: "base-ui-preview",
                  mediaType: "text/markdown",
                  type: "file",
                  url: "#base-ui-preview",
                }}
              >
                <span className="font-medium text-sm">base-ui-preview.md</span>
              </Attachment>
              <Attachment
                data={{
                  filename: "dependency-upgrade.md",
                  id: "dependency-upgrade",
                  mediaType: "text/markdown",
                  type: "file",
                  url: "#dependency-upgrade",
                }}
              >
                <span className="font-medium text-sm">
                  dependency-upgrade.md
                </span>
              </Attachment>
            </Attachments>
            <p className="text-muted-foreground text-xs leading-5">
              These attachments prove the static Pages app is importing AI
              Elements package code, not only local preview markup.
            </p>
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
          description="Submit a message to verify the prompt form, textarea, and submit button stay interactive."
          title="Prompt Input"
        >
          <PromptInput
            onSubmit={({ text }) => {
              setSubmittedPrompt(text || "Empty submission");
            }}
          >
            <PromptInputTextarea
              name="message"
              placeholder="Ask the preview assistant..."
            />
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit aria-label="Submit acceptance note">
                <SendIcon className="size-4" />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-4 text-muted-foreground text-sm">
            Last submitted prompt: <span>{submittedPrompt}</span>
          </p>
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
