import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DisclaimerBadge() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Responsible AI Disclaimer"
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Responsible AI</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Responsible AI Disclaimer
          </DialogTitle>
          <DialogDescription className="pt-2 text-left text-sm leading-relaxed text-muted-foreground">
            PhandaSmart is an AI-assisted tool designed to help South African job seekers save
            time and work smarter. All AI-generated content — including CVs, emails, plans, and
            research — should be reviewed and personalised before use. Do not submit
            AI-generated content without reading it first. PhandaSmart is not responsible for
            outcomes resulting from the use of generated content.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
