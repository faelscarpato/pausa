
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Operator } from "@/types/attendance";
import { supabase } from "@/integrations/supabase/client";

interface OperatorDialogProps {
  operator?: Operator;
  onSave: () => void;
  trigger: React.ReactNode;
  mode: 'edit' | 'add';
}

const OperatorDialog: React.FC<OperatorDialogProps> = ({ operator, onSave, trigger, mode }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"operator" | "supervisor">("operator");
  const [supervisorId, setSupervisorId] = useState<string>("");
  const [breakHour, setBreakHour] = useState<string>("15");
  const [loading, setLoading] = useState(false);
  const [supervisors, setSupervisors] = useState<Operator[]>([]);

  // Fetch supervisors for dropdown
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        console.log("Fetching supervisors...");
        const { data, error } = await supabase
          .from('employees_new')
          .select('*')
          .eq('role', 'supervisor');
        
        if (error) throw error;
        
        if (data) {
          console.log("Fetched supervisors:", data.length);
          const mappedSupervisors = data.map(sup => ({
            id: sup.id.toString(),
            name: sup.name,
            role: 'supervisor' as const,
            isSupervisor: true
          }));
          setSupervisors(mappedSupervisors);
        }
      } catch (error) {
        console.error("Error fetching supervisors:", error);
      }
    };

    if (open) {
      fetchSupervisors();
    }
  }, [open]);

  useEffect(() => {
    if (operator) {
      setName(operator.name);
      setRole(operator.role);
      
      // If editing an operator, fetch their supervisor and break hour
      if (operator.role === 'operator' && open) {
        const fetchOperatorDetails = async () => {
          try {
            console.log("Fetching details for operator:", operator.id);
            // Get supervisor assignment
            const { data: assignmentData, error: assignmentError } = await supabase
              .from('break_assignments_new')
              .select('supervisor_id')
              .eq('operator_id', parseInt(operator.id))
              .single();
            
            if (!assignmentError && assignmentData) {
              console.log("Found supervisor assignment:", assignmentData);
              setSupervisorId(assignmentData.supervisor_id.toString());
            }
            
            // Get current month break hour
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            
            const { data: rotationData, error: rotationError } = await supabase
              .from('break_rotations_new')
              .select('hour')
              .eq('operator_id', parseInt(operator.id))
              .eq('month', month)
              .eq('year', year)
              .single();
            
            if (!rotationError && rotationData) {
              console.log("Found break rotation:", rotationData);
              setBreakHour(rotationData.hour.toString());
            } else {
              setBreakHour("15"); // Default
            }
            
          } catch (error) {
            console.error("Error fetching operator details:", error);
          }
        };
        
        fetchOperatorDetails();
      }
    } else {
      setName("");
      setRole("operator");
      setSupervisorId("");
      setBreakHour("15");
    }
  }, [operator, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro", 
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Supervisor is required for operators
    if (role === 'operator' && !supervisorId) {
      toast({
        title: "Erro", 
        description: "Trocador é obrigatório para operadores",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      let employeeId: number;
      
      if (mode === 'edit' && operator) {
        console.log("Updating employee:", {
          id: operator.id,
          name: name.trim(),
          role: role
        });
        
        // Update employee in Supabase
        const { error } = await supabase
          .from('employees_new')
          .update({ 
            name: name.trim(),
            role: role
          })
          .eq('id', parseInt(operator.id));

        if (error) throw error;
        employeeId = parseInt(operator.id);
        
        toast({
          title: "Sucesso", 
          description: "Funcionário atualizado com sucesso"
        });
      } else if (mode === 'add') {
        console.log("Adding new employee:", {
          name: name.trim(),
          role: role
        });
        
        // Add new employee to Supabase
        const { data, error } = await supabase
          .from('employees_new')
          .insert({ 
            name: name.trim(),
            role: role
          })
          .select();

        if (error) throw error;
        employeeId = data[0].id;
        
        toast({
          title: "Sucesso", 
          description: "Funcionário adicionado com sucesso"
        });
      } else {
        throw new Error("Invalid mode");
      }
      
      // If employee is an operator, update their supervisor assignment and break hour
      if (role === 'operator') {
        console.log("Updating break assignments for operator:", employeeId);
        
        // Update supervisor assignment
        const { error: assignmentError } = await supabase
          .from('break_assignments_new')
          .upsert(
            { 
              supervisor_id: parseInt(supervisorId),
              operator_id: employeeId
            },
            { onConflict: 'operator_id' }
          );
        
        if (assignmentError) throw assignmentError;
        
        // Update break rotation for current month
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        console.log("Updating break rotation for operator:", {
          operator_id: employeeId,
          month: month,
          year: year,
          hour: parseInt(breakHour)
        });
        
        const { error: rotationError } = await supabase
          .from('break_rotations_new')
          .upsert(
            {
              operator_id: employeeId,
              month: month,
              year: year,
              hour: parseInt(breakHour)
            },
            { onConflict: 'operator_id, month, year' }
          );
        
        if (rotationError) throw rotationError;
      }
      
      setOpen(false);
      onSave();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      toast({
        title: "Erro", 
        description: "Ocorreu um erro ao salvar o funcionário", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nome do Funcionário</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do funcionário"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">Função</label>
            <Select value={role} onValueChange={(value: "operator" | "supervisor") => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operador</SelectItem>
                <SelectItem value="supervisor">Trocador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {role === 'operator' && (
            <>
              <div className="space-y-2">
                <label htmlFor="supervisor" className="text-sm font-medium">Trocador Responsável</label>
                <Select value={supervisorId} onValueChange={setSupervisorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o trocador responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="breakHour" className="text-sm font-medium">Horário de Pausa</label>
                <Select value={breakHour} onValueChange={setBreakHour}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário de pausa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15h</SelectItem>
                    <SelectItem value="16">16h</SelectItem>
                    <SelectItem value="17">17h</SelectItem>
                    <SelectItem value="18">18h</SelectItem>
                    <SelectItem value="19">19h</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Na virada do mês, os horários de pausa serão rotacionados automaticamente.
                </p>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OperatorDialog;
