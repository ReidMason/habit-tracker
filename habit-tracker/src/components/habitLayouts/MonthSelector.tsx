import { formatDate } from "@/lib/utils";
import { Button } from "../ui/button";

interface Props {
  pivotDate: Date;
  setPivotDate: (date: Date) => void;
}

export default function MonthSelector({ pivotDate, setPivotDate }: Props) {
  return (
    <div className="flex gap-2 items-center mb-4">
      <Button
        onClick={() => {
          const newDate = new Date(pivotDate);
          newDate.setMonth(newDate.getMonth() - 1);
          setPivotDate(newDate);
        }}
      >
        Prev
      </Button>
      <p className="w-36 text-center">{formatDate(pivotDate)}</p>
      <Button
        onClick={() => {
          const newDate = new Date(pivotDate);
          newDate.setMonth(newDate.getMonth() + 1);
          setPivotDate(newDate);
        }}
      >
        Next
      </Button>
    </div>
  );
}
