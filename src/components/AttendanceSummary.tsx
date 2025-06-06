
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Edit, Trash2, Plus, RefreshCw } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import OperatorDialog from "@/components/OperatorDialog";
import { toast } from "@/hooks/use-toast";
import { Operator } from "@/types/attendance";
import { supabase } from "@/integrations/supabase/client";
import { useAttendance } from "@/contexts/AttendanceContext";
import { formatDate } from "@/lib/data";

const AttendanceSummary: React.FC = () => {
  const { selectedDate, getAttendanceStatus } = useAttendance();
  const formattedDate = formatDate(selectedDate);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      console.log("Fetching operators for attendance summary...");
      const { data, error } = await supabase
        .from('employees_new')
        .select('*');
      
      if (error) throw error;
      
      // Convert Supabase data to our Operator type
      if (data) {
        console.log("Fetched operators:", data.length);
        const mappedOperators: Operator[] = data.map(emp => ({
          id: emp.id.toString(),
          name: emp.name,
          role: emp.role as 'operator' | 'supervisor',
          isSupervisor: emp.role === 'supervisor'
        }));
        setOperators(mappedOperators);
      }
    } catch (error) {
      console.error("Error fetching operators:", error);
      toast({
        title: "Erro", 
        description: "Falha ao carregar lista de funcionários", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
    fetchOperators();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-center">Resumo de Presenças do Dia</CardTitle>
        <OperatorDialog 
          mode="add" 
          onSave={handleRefreshData}
          trigger={
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Adicionar Funcionário
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p>Carregando funcionários...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {operators.map(operator => {
              const status = getAttendanceStatus(operator.id, formattedDate);
              
              let bgColor = "bg-gray-100"; // Unregistered
              if (status === "present") bgColor = "bg-green-100";
              if (status === "absent") bgColor = "bg-red-100";
              
              return (
                <div 
                  key={operator.id} 
                  className={`${bgColor} p-3 rounded-lg border flex items-center justify-between`}
                >
                  <div className="flex items-center flex-grow">
                    <span className="font-medium">{operator.name}</span>
                    <StatusIcon status={status} />
                  </div>
                  <div className="flex space-x-1">
                    <OperatorDialog 
                      operator={operator} 
                      mode="edit" 
                      onSave={handleRefreshData}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setOperatorToDelete(operator);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      {/* Confirmation Dialog for Deleting Operator */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {operatorToDelete?.name}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                try {
                  if (operatorToDelete) {
                    console.log("Deleting operator:", operatorToDelete.id);
                    // Delete operator from Supabase
                    const { error } = await supabase
                      .from('employees_new')
                      .delete()
                      .eq('id', parseInt(operatorToDelete.id));
                      
                    if (error) throw error;
                    
                    toast({
                      title: "Sucesso", 
                      description: "Funcionário excluído com sucesso" 
                    });
                    
                    // Refresh the data
                    handleRefreshData();
                  }
                } catch (error) {
                  console.error("Erro ao excluir funcionário:", error);
                  toast({
                    title: "Erro", 
                    description: "Ocorreu um erro ao excluir o funcionário", 
                    variant: "destructive" 
                  });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "present":
      return <Check className="text-green-600 h-5 w-5 ml-2" />;
    case "absent":
      return <X className="text-red-600 h-5 w-5 ml-2" />;
    default:
      return <span className="text-gray-400 text-sm ml-2">Não registrado</span>;
  }
};

export default AttendanceSummary;
