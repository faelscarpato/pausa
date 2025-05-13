
import React from "react";
import Layout from "@/components/Layout";
import DateSelector from "@/components/DateSelector";
import BreakScheduleTable from "@/components/BreakScheduleTable";

const BreaksPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <DateSelector />
        
        <div className="bg-yellow-100 p-4 rounded-md border border-yellow-300 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Importante</h3>
          <p className="text-yellow-700">
            Quando um funcionário está ausente, ele não aparece na tabela de horários de pausa.
            Os funcionários que viriam depois dele apenas antecedem 1 hora em seus horários de pausa.
            Os supervisores sempre mantêm o horário de 20h.
          </p>
        </div>
        
        <BreakScheduleTable />
      </div>
    </Layout>
  );
};

export default BreaksPage;
