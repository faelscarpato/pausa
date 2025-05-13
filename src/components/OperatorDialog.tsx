
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (operator) {
      setName(operator.name);
      setRole(operator.role);
    } else {
      setName("");
      setRole("operator");
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

    setLoading(true);
    try {
      if (mode === 'edit' && operator) {
        // Atualizar funcionário no Supabase
        const { error } = await supabase
          .from('employees')
          .update({ 
            name: name.trim(),
            role: role
          })
          .eq('id', parseInt(operator.id)); // Convert string to number

        if (error) throw error;
        toast({
          title: "Sucesso", 
          description: "Funcionário atualizado com sucesso"
        });
      } else if (mode === 'add') {
        // Adicionar novo funcionário no Supabase
        const { error } = await supabase
          .from('employees')
          .insert({ 
            name: name.trim(),
            role: role
          });

        if (error) throw error;
        toast({
          title: "Sucesso", 
          description: "Funcionário adicionado com sucesso"
        });
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
                <SelectItem value="supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
