import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { TransactionType } from "@prisma/client";
import { endOfMonth, isValid, parseISO, startOfMonth } from "date-fns";
import { TotalExpensePerCategory, TransactionPercentagePerType } from "./types";

export async function getDashboard(month: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  let baseFilters = {};
  if (month) {
    const currentYear = new Date().getFullYear();
    const monthWithLeadingZero = month.padStart(2, "0"); // Garantir que o mês tenha dois dígitos
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

  const [depositsTotal, investmentsTotal, expensesTotal] = await Promise.all([
    db.transaction.aggregate({
      where: { ...baseFilters, type: "DEPOSIT" },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { ...baseFilters, type: "INVESTMENT" },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { ...baseFilters, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  const depositsAmount = Number(depositsTotal._sum.amount) || 0;
  const investmentsAmount = Number(investmentsTotal._sum.amount) || 0;
  const expensesAmount = Number(expensesTotal._sum.amount) || 0;

  const balance = depositsAmount - investmentsAmount - expensesAmount;

  const transactionsTotal = Number(
    (
      await db.transaction.aggregate({
        where: baseFilters,
        _sum: { amount: true },
      })
    )._sum.amount,
  );
  const typesPercentage: TransactionPercentagePerType = {
    [TransactionType.DEPOSIT]: Math.round(
      (Number(depositsAmount || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.EXPENSE]: Math.round(
      (Number(expensesAmount || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.INVESTMENT]: Math.round(
      (Number(investmentsAmount || 0) / Number(transactionsTotal)) * 100,
    ),
  };

  const totalExpensePerCategory: TotalExpensePerCategory[] = (
    await db.transaction.groupBy({
      by: ["category"],
      where: {
        ...baseFilters,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    })
  ).map((category) => ({
    category: category.category,
    totalAmount: Number(category._sum.amount),
    percentageOfTotal: Math.round(
      (Number(category._sum.amount) / Number(expensesAmount)) * 100,
    ),
  }));
  const lastTransactions = await db.transaction.findMany({
    where: baseFilters,
    orderBy: { date: "desc" },
    take: 15,
  });

  return {
    balance,
    depositsAmount,
    investmentsAmount,
    expensesAmount,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions: JSON.parse(JSON.stringify(lastTransactions)),
  };
}
