import {
  WalletIcon,
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { SummaryCard } from "./summary-card";
import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth, parseISO, isValid } from "date-fns";

interface SummaryCardProps {
  month?: string;
}

export async function SummaryCards({ month }: SummaryCardProps) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  let monthFilter = {};
  if (month) {
    const currentYear = new Date().getFullYear();
    const monthWithLeadingZero = month.padStart(2, "0"); // Garantir que o mês tenha dois dígitos
    const parsedDate = parseISO(`${currentYear}-${monthWithLeadingZero}-01`);
    if (!isValid(parsedDate)) {
      throw new Error("Invalid month format. Expected format: MM");
    }

    const startDate = startOfMonth(parsedDate);
    const endDate = endOfMonth(parsedDate);

    monthFilter = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  const [depositsTotal, investmentsTotal, expensesTotal] = await Promise.all([
    db.transaction.aggregate({
      where: { ...monthFilter, type: "DEPOSIT", userId },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { ...monthFilter, type: "INVESTMENT", userId },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { ...monthFilter, type: "EXPENSE", userId },
      _sum: { amount: true },
    }),
  ]);

  const depositsAmount = Number(depositsTotal._sum.amount) || 0;
  const investmentsAmount = Number(investmentsTotal._sum.amount) || 0;
  const expensesAmount = Number(expensesTotal._sum.amount) || 0;

  const balance = depositsAmount - investmentsAmount - expensesAmount;

  return (
    <div className="space-y-6">
      <SummaryCard
        size="large"
        icon={<WalletIcon size={16} />}
        title="Saldo"
        amount={balance}
      />

      <div className="grid grid-cols-3 gap-6">
        <SummaryCard
          icon={<PiggyBankIcon size={16} />}
          title="Investimentos"
          amount={investmentsAmount}
        />
        <SummaryCard
          icon={<TrendingUpIcon size={16} className="text-primary" />}
          title="Receitas"
          amount={depositsAmount}
        />
        <SummaryCard
          icon={<TrendingDownIcon size={16} className="text-red-500" />}
          title="Despesas"
          amount={expensesAmount}
        />
      </div>
    </div>
  );
}
