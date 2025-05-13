
import React from "react";
import Layout from "@/components/Layout";
import DateSelector from "@/components/DateSelector";
import AttendanceForm from "@/components/AttendanceForm";
import AttendanceSummary from "@/components/AttendanceSummary";

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <DateSelector />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <AttendanceForm />
          <div className="flex flex-col space-y-4">
            <div className="bg-blue-100 p-4 rounded-md border border-blue-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Instruções</h3>
              <p className="text-sm text-blue-700">
                Use o formulário ao lado para registrar a presença ou ausência de um funcionário.
                Selecione o funcionário, indique se está presente ou ausente, e clique em "Registrar".
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-md border border-green-300">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Como funciona</h3>
              <p className="text-sm text-green-700">
                Quando um funcionário é registrado como ausente, os horários de pausa são 
                automaticamente ajustados. Você pode ver esses ajustes na página "Horários de Pausa".
              </p>
            </div>
          </div>
        </div>
        
        <AttendanceSummary />
      </div>
    </Layout>
  );
};

export default Index;
