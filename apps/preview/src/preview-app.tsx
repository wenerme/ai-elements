import { Attachments, Attachment } from "@repo/elements/attachments";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@repo/elements/prompt-input";
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
import { ChevronDownIcon, SendIcon } from "lucide-react";
import { useMemo, useState } from "react";

const checks = [
  "Toast uses Base UI manager without runtime crashes",
  "Select opens positioned popup and selects values",
  "Slider renders control/track/range/thumb correctly",
  "Progress forwards value to ARIA and indicator state",
  "Dropdown callbacks behave like previous shadcn/Radix API",
  "PromptInput submits and remains usable after dependency upgrades",
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
  const [selectValue, setSelectValue] = useState("base-ui");
  const [sliderValue, setSliderValue] = useState([42]);
  const [progressValue, setProgressValue] = useState(42);
  const [dropdownAction, setDropdownAction] = useState("No action yet");
  const [submittedPrompt, setSubmittedPrompt] = useState(
    "No prompt submitted yet"
  );

  const status = useMemo(
    () => ({
      dropdownAction,
      progressValue,
      selectValue,
      sliderValue: sliderValue[0] ?? 0,
      submittedPrompt,
    }),
    [dropdownAction, progressValue, selectValue, sliderValue, submittedPrompt]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Toaster />
      <header className="space-y-3">
        <p className="font-medium text-muted-foreground text-sm">
          AI Elements Preview
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
              Base UI Migration Acceptance
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Static GitHub Pages smoke test for the dependency upgrade and Base
              UI primitive adapters.
            </p>
          </div>
          <Button
            onClick={() =>
              toast({
                description: `Preview toast fired at ${formatNow()}`,
                title: "Toast works",
              })
            }
          >
            Trigger Toast
          </Button>
        </div>
      </header>

      <section className="grid gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <div className="flex items-start gap-2 text-sm" key={check}>
            <span className="mt-0.5 size-2 rounded-full bg-primary" />
            <span>{check}</span>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          description="Open the popup, choose another value, then verify the status panel updates."
          title="Select"
        >
          <Select onValueChange={setSelectValue} value={selectValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a component" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base-ui">Base UI adapter</SelectItem>
              <SelectItem value="toast">Toast manager</SelectItem>
              <SelectItem value="prompt-input">Prompt input</SelectItem>
            </SelectContent>
          </Select>
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
              <DropdownMenuLabel>Acceptance actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDropdownAction("Inspect selected")}
              >
                Inspect
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setDropdownAction("Approve selected")}
              >
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setDropdownAction("Retry selected")}
              >
                Retry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="mt-4 text-muted-foreground text-sm">{dropdownAction}</p>
        </Section>

        <Section
          description="Submit a message to verify the prompt form, textarea, and submit button stay interactive."
          title="Prompt Input"
        >
          <PromptInput
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              setSubmittedPrompt(
                String(formData.get("message") || "Empty submission")
              );
              event.currentTarget.reset();
            }}
          >
            <PromptInputTextarea
              name="message"
              placeholder="Type an acceptance note..."
            />
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit>
                <SendIcon className="size-4" />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-4 text-muted-foreground text-sm">
            {submittedPrompt}
          </p>
        </Section>
      </div>

      <Section
        description="Lightweight AI Elements composition to ensure package imports and styles work outside the Next docs app."
        title="AI Elements Composition"
      >
        <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
          <p className="text-sm">
            The static preview is built with Vite and deployed by GitHub Pages
            for manual acceptance.
          </p>
          <Attachments>
            <Attachment name="base-ui-preview.md" />
            <Attachment name="dependency-upgrade.md" />
          </Attachments>
        </div>
      </Section>

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
