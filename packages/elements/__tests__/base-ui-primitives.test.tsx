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
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import React from "react";

describe("base UI shadcn primitives", () => {
  it("renders toast notifications through the Base UI toast manager", async () => {
    render(<Toaster />);

    toast({ description: "Changes were saved", title: "Saved" });

    await expect(screen.findByText("Saved")).resolves.toBeInTheDocument();
    expect(screen.getByText("Changes were saved")).toBeInTheDocument();
  });

  it("passes progress value to Base UI ARIA state", () => {
    render(<Progress value={42} />);

    const progress = screen.getByRole("progressbar");

    expect(progress).toHaveAttribute("aria-valuenow", "42");
    expect(progress).toHaveAttribute("aria-valuemax", "100");
    expect(progress).toHaveAttribute("aria-valuemin", "0");
  });

  it("renders an interactive Base UI slider control", () => {
    render(<Slider aria-label="Volume" defaultValue={[25]} />);

    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("opens select content with Base UI positioning variables", async () => {
    const user = userEvent.setup();

    render(
      <Select defaultValue="one">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
          <SelectItem value="two">Two</SelectItem>
        </SelectContent>
      </Select>
    );

    await user.click(screen.getByRole("combobox"));

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Two" })).toBeInTheDocument();
    });
  });
});
