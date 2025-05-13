
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateBR } from "@/lib/data";
import { useAttendance } from "@/contexts/AttendanceContext";

const DateSelector: React.FC = () => {
  const { selectedDate, setSelectedDate } = useAttendance();

  return (
    <div className="flex flex-col items-center space-y-2 mb-8">
      <h2 className="text-xl font-semibold">Data Selecionada</h2>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[240px] justify-center text-lg"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateBR(selectedDate)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
