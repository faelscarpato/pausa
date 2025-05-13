
import React from "react";
import Layout from "@/components/Layout";
import AbsenceMonthlyReport from "@/components/AbsenceMonthlyReport";
import MonthlyCalendarView from "@/components/MonthlyCalendarView";
import DateSelector from "@/components/DateSelector";

const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <DateSelector />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-indigo-100 p-4 rounded-md border border-indigo-300">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">Dashboard</h3>
            <p className="text-indigo-700">
              Este painel mostra informações sobre o absenteísmo dos funcionários.
              Você pode visualizar as ausências por mês no gráfico abaixo e no calendário mensal.
            </p>
          </div>
          
          <div className="bg-purple-100 p-4 rounded-md border border-purple-300">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Análise</h3>
            <p className="text-purple-700">
              Use estas visualizações para identificar padrões de ausência e tomar decisões 
              informadas sobre a gestão de pessoal.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <AbsenceMonthlyReport />
          <MonthlyCalendarView />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
