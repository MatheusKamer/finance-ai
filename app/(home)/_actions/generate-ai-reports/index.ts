"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { endOfMonth, isValid, parseISO, startOfMonth } from "date-fns";
import OpenAI from "openai";
import { GenerateAiReportSchema, generateAiReportSchema } from "./schema";

export async function generateAiReport({ month }: GenerateAiReportSchema) {
  generateAiReportSchema.parse({ month });
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // const user = await clerkClient().users.getUser(userId);
  // const isPremium = user.publicMetadata.subscriptionPlan === "premium";

  // if (!isPremium) {
  //   throw new Error("User is not premium");
  // }

  let baseFilters = {};
  if (month) {
    const currentYear = new Date().getFullYear();
    const monthWithLeadingZero = month.padStart(2, "0");
    const parsedDate = parseISO(`${currentYear}-${monthWithLeadingZero}-01`);
    if (!isValid(parsedDate)) {
      throw new Error("Invalid month format. Expected format: MM");
    }

    const startDate = startOfMonth(parsedDate);
    const endDate = endOfMonth(parsedDate);

    baseFilters = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const transactions = await db.transaction.findMany({
    where: {
      ...baseFilters,
    },
  });

  const content = `Gere um relatório com insights sobre as minhas finanças, com dicas e orientações de como melhorar minha vida financeira. As transações estão divididas por ponto e vírgula. A estrutura de cada uma é {DATA}-{TIPO}-{VALOR}-{CATEGORIA}. São elas:
  ${transactions
    .map(
      (transaction) =>
        `${transaction.date.toLocaleDateString("pt-BR")}-R$${transaction.amount}-${transaction.type}-${transaction.category}`,
    )
    .join(";")}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Você é um especialista em gestão e organização de finanças pessoais. Você ajuda as pessoas a organizarem melhor as suas finanças.",
      },
      {
        role: "user",
        content,
      },
    ],
  });

  return completion.choices[0].message.content;
}
