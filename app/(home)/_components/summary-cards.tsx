import {
  WalletIcon,
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { SummaryCard } from "./summary-card";

interface SummaryCardsProps {
  month?: string;
  balance: number;
  depositsAmount: number;
  investmentsAmount: number;
  expensesAmount: number;
  userCanAddTransaction?: boolean;
}

export async function SummaryCards({
  balance,
  depositsAmount,
  investmentsAmount,
  expensesAmount,
  userCanAddTransaction,
}: SummaryCardsProps) {
  return (
    <div className="space-y-6">
      <SummaryCard
        size="large"
        icon={<WalletIcon size={16} />}
        title="Saldo"
        amount={balance}
        userCanAddTransaction={userCanAddTransaction}
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
