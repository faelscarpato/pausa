
import React from "react";
import Layout from "@/components/Layout";
import DateSelector from "@/components/DateSelector";
import BreakScheduleTable from "@/components/BreakScheduleTable";

const BreaksPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <DateSelector />
        
        <div className="bg-yellow-100 p-4 rounded-md border border-yellow-300 mb-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Importante</h3>
          <p className="text-yellow-700">
            Quando um funcionário está ausente, ele não aparece na tabela de horários de pausa.
            Os horários são mantidos conforme a rotação mensal, apenas com os funcionários presentes.
          </p>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-md border border-blue-300 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Sistema de Rotação Mensal</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>No início de cada mês, os horários de pausa são rotacionados automaticamente.</li>
            <li>Os operadores que jantavam às 15h passam para 16h, os de 16h passam para 17h e assim por diante.</li>
            <li>Os operadores que jantavam às 19h voltam para 15h no próximo mês.</li>
            <li>Os trocadores (supervisores) sempre mantêm o horário fixo de 20h.</li>
          </ul>
        </div>
        
        <BreakScheduleTable />
      </div>
    </Layout>
  );
};

export default BreaksPage;
