
import React, { useEffect, useState } from "react";
import { useAttendance } from "@/contexts/AttendanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateBR } from "@/lib/data";
import { Clock, Printer, FileDown, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Operator } from "@/types/attendance";

const BreakScheduleTable: React.FC = () => {
  const { selectedDate, getBreakSchedule, generateBreakSchedules } = useAttendance();
  const formattedDate = formatDate(selectedDate);
  const schedules = getBreakSchedule(formattedDate);
  const tableRef = React.useRef<HTMLDivElement>(null);
  const [employees, setEmployees] = useState<Record<string, Operator>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        console.log("Fetching employees for break schedule table...");
        const { data, error } = await supabase
          .from('employees_new')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          console.log("Fetched employees:", data.length);
          const employeeMap: Record<string, Operator> = {};
          data.forEach(emp => {
            employeeMap[emp.id] = {
              id: emp.id.toString(),
              name: emp.name,
              role: emp.role as 'operator' | 'supervisor',
              isSupervisor: emp.role === 'supervisor'
            };
          });
          
          setEmployees(employeeMap);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados dos funcionários",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  useEffect(() => {
    console.log("Current schedules:", schedules);
    console.log("Current employees:", employees);
  }, [schedules, employees]);
  
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
  
  const handleRegenerateSchedules = async () => {
    await generateBreakSchedules(formattedDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!tableRef.current) return;
    
    try {
      // Set styles before capturing
      const originalStyles = tableRef.current.style.cssText;
      tableRef.current.style.width = "100%";
      tableRef.current.style.maxWidth = "800px";
      tableRef.current.style.margin = "0 auto";
      
      const canvas = await html2canvas(tableRef.current, {
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Reset original styles
      tableRef.current.style.cssText = originalStyles;
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add header information
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setFontSize(16);
      pdf.text(`Horários de Pausa - ${formatDateBR(selectedDate)}`, pageWidth/2, 15, { align: 'center' });
      
      // Calculate dimensions to fit the page properly
      const imgWidth = pageWidth - 20; // 10mm margins on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);
      
      // Add footer
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 15, pdf.internal.pageSize.getHeight() - 10, { align: 'right' });
      
      // Download the PDF
      pdf.save(`horarios-pausa-${formattedDate}.pdf`);
      
      toast({
        title: "Sucesso",
        description: "PDF exportado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro",
        description: "Falha ao exportar PDF",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Horários de Pausa</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p>Carregando horários de pausa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              <RefreshCw className="mr-2 h-4 w-4" />
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
                const supervisor = employees[supervisorId];
                if (!supervisor) return null;
                
                return (
                  <tr key={supervisorId} className={index % 2 === 0 ? "bg-blue-50" : "bg-blue-100"}>
                    <td className="p-2 text-center border border-blue-200 font-semibold">
                      {supervisor.name}
                    </td>
                    {[15, 16, 17, 18, 19, 20].map(hour => {
                      const schedule = schedules.find(s => s.hour === hour);
                      if (!schedule) return <td key={hour} className="p-2 text-center border border-blue-200">-</td>;
                      
                      const operator = employees[schedule.operatorId];
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
