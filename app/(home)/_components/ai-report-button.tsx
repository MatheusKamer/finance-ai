"use client";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { BotIcon, LoaderIcon } from "lucide-react";
import { generateAiReport } from "../_actions/generate-ai-reports";
import { useState } from "react";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import Markdown from "react-markdown";
import Link from "next/link";

interface AiReportButtonProps {
  hasPremiumPlan: boolean;
  month: string;
}

export function AiReportButton({ month, hasPremiumPlan }: AiReportButtonProps) {
  const [report, setReport] = useState<string | null>();
  const [reportIsLoading, setReportIsLoading] = useState(false);
  const handleGenerateReports = async () => {
    try {
      setReportIsLoading(true);
      const aiReports = await generateAiReport({ month });
      setReport(aiReports);
    } catch (error) {
      console.error("Failed to generate AI reports", error);
    } finally {
      setReportIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          Relatório IA
          <BotIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px]">
        {hasPremiumPlan ? (
          <>
            <DialogHeader>
              <DialogTitle>Relatório IA</DialogTitle>
              <DialogDescription>
                Use inteligência artificial para gerar um relatório com insights
                sobre suas finanças.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="prose max-h-[450px] text-white prose-h3:text-white prose-h4:text-white prose-strong:text-white">
              <Markdown>{report || ""}</Markdown>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={handleGenerateReports}
                disabled={reportIsLoading}
              >
                {reportIsLoading ? (
                  <LoaderIcon size={16} className="animate-spin" />
                ) : (
                  "Gerar relatório"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Relatório IA</DialogTitle>
              <DialogDescription>
                Para gerar um relatório com insights sobre suas finanças, você
                precisa ter um plano premium.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button asChild>
                <Link href={"/subscription"}>Upgrade para premium</Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
