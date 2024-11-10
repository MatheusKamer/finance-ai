import { db } from "../_lib/prisma";

export default async function Transactions() {
  const transactions = await db.transaction.findMany({});
  return (
    <div>
      <h1>Transactions</h1>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>{transaction.name}</li>
        ))}
        ;
      </ul>
    </div>
  );
}
