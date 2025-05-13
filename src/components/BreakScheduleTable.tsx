
import React from "react";
import { useAttendance } from "@/contexts/AttendanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, getOperatorById } from "@/lib/data";
import { Clock, Printer, FileDown } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BreakScheduleTable: React.FC = () => {
  const { selectedDate, breakSchedules, getBreakSchedule, generateBreakSchedules } = useAttendance();
  const formattedDate = formatDate(selectedDate);
  const schedules = getBreakSchedule(formattedDate);
  const tableRef = React.useRef<HTMLDivElement>(null);
  
  // Group schedules by supervisor
  const scheduleBySupervisor = React.useMemo(() => {
    const grouped = schedules.reduce((acc, schedule) => {
      const { supervisorId } = schedule;
      if (!acc[supervisorId]) {
        acc[supervisorId] = [];
      }
      acc[supervisorId].push(schedule);
      return acc;
    }, {} as Record<string, typeof schedules>);
    
    // Sort by hour within each group
    Object.keys(grouped).forEach(supervisorId => {
      grouped[supervisorId].sort((a, b) => a.hour - b.hour);
    });
    
    return grouped;
  }, [schedules]);
  
  const handleRegenerateSchedules = () => {
    generateBreakSchedules(formattedDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!tableRef.current) return;
    
    try {
      const canvas = await html2canvas(tableRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      // Criar PDF em orientação paisagem (landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });
      
      // Ajustar tamanho da imagem para caber na página
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Adicionar a imagem ao PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Download do PDF
      pdf.save(`horarios-pausa-${formattedDate}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    }
  };

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Horários de Pausa</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Não há horários de pausa definidos para esta data.</p>
          <Button onClick={handleRegenerateSchedules}>
            <Clock className="mr-2" />
            Gerar Horários de Pausa
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-center">Horários de Pausa</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={handleRegenerateSchedules} variant="outline" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              Atualizar Horários
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-blue-600 text-white p-2 text-sm md:text-base border border-blue-300">TROCADOR</th>
                <th className="bg-blue-600 text-white p-2 text-sm md:text-base border border-blue-300">15h</th>
                <th className="bg-blue-600 text-white p-2 text-sm md:text-base border border-blue-300">16h</th>
                <th className="bg-blue-600 text-white p-2 text-sm md:text-base border border-blue-300">17h</th>
                <th className="bg-blue-600 text-white p-2 text-sm md:text-base border border-blue-300">18h</th>
                <th className="bg-blue-600 text-white p-2 text-sm md:text-base border border-blue-300">19h</th>
                <th className="bg-blue-600 text-white p-2 text-sm md:text-base border border-blue-300">20h</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scheduleBySupervisor).map(([supervisorId, schedules], index) => {
                const supervisor = getOperatorById(supervisorId);
                if (!supervisor) return null;
                
                return (
                  <tr key={supervisorId} className={index % 2 === 0 ? "bg-blue-50" : "bg-blue-100"}>
                    <td className="p-2 text-center border border-blue-200 font-semibold">{supervisor.name}</td>
                    {[15, 16, 17, 18, 19, 20].map(hour => {
                      const schedule = schedules.find(s => s.hour === hour);
                      if (!schedule) return <td key={hour} className="p-2 text-center border border-blue-200">-</td>;
                      
                      const operator = getOperatorById(schedule.operatorId);
                      return (
                        <td key={hour} className="p-2 text-center border border-blue-200">
                          {operator?.name || '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakScheduleTable;
