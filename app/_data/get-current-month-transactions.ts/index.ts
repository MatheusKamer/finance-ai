import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { endOfMonth, startOfMonth } from "date-fns";

export async function getCurrentMonthTransactions() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not found");
  }
  const currentMonthTransactions = await db.transaction.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth(new Date()),
        lt: endOfMonth(new Date()),
      },
    },
  });

  return currentMonthTransactions;
}
