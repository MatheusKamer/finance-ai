// import { ReactNode } from "react";

// interface PercentageItemProps {
//   icon: ReactNode;
//   title: string;
//   value: number;
// }

// export function PercentageItem({ icon, title, value }: PercentageItemProps) {
//   <div className="space-y-2">
//     <div className="flex items-center justify-between">
//       <div className="flex items-center gap-2">
//         {icon}
//         <p className="text-sm text-muted-foreground">{title}</p>
//       </div>
//       <p className="text-sm font-bold">{value}%</p>
//     </div>
//   </div>;
// }

import { ReactNode } from "react";

interface PercentageItemProps {
  icon: ReactNode;
  title: string;
  value: number;
}

const PercentageItem = ({ icon, title, value }: PercentageItemProps) => {
  return (
    <div className="flex items-center justify-between">
      {/* Icone */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white bg-opacity-[3%] p-2">{icon}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className="text-sm font-bold">{value}%</p>
    </div>
  );
};

export default PercentageItem;