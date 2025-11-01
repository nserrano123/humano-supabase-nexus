import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const jobPositionSchema = z.object({
  name: z.string().min(1, "Nombre es requerido").max(200),
  description: z.string().min(1, "Descripción es requerida"),
  evaluation_criteria: z.string().min(1, "Criterios de evaluación son requeridos"),
  department: z.string().max(100).optional(),
  work_mode: z.string().optional(),
  llm_score_threshold: z.number().min(0).max(1)
});

interface JobPositionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPosition?: any;
  onSuccess?: () => void;
}

export default function JobPositionFormModal({
  open,
  onOpenChange,
  jobPosition,
  onSuccess
}: JobPositionFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    evaluation_criteria: "",
    department: "",
    work_mode: "Remote",
    is_open: true,
    active: true,
    llm_score_threshold: 0.5
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (jobPosition) {
      setFormData({
        name: jobPosition.name || "",
        description: jobPosition.description || "",
        evaluation_criteria: jobPosition.evaluation_criteria || "",
        department: jobPosition.department || "",
        work_mode: jobPosition.work_mode || "Remote",
        is_open: jobPosition.is_open ?? true,
        active: jobPosition.active ?? true,
        llm_score_threshold: jobPosition.llm_score_threshold || 0.5
      });
    } else {
      setFormData({
        name: "",
        description: "",
        evaluation_criteria: "",
        department: "",
        work_mode: "Remote",
        is_open: true,
        active: true,
        llm_score_threshold: 0.5
      });
    }
    setErrors({});
  }, [jobPosition, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      jobPositionSchema.parse(formData);
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (jobPosition) {
        // Update
        const { error } = await supabase
          .from('job_position')
          .update(formData)
          .eq('id', jobPosition.id);

        if (error) throw error;
        toast.success("Posición actualizada correctamente");
      } else {
        // Create
        const { error } = await supabase
          .from('job_position')
          .insert(formData);

        if (error) throw error;
        toast.success("Posición creada correctamente");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving job position:", error);
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-ff-primary">
            {jobPosition ? "Editar Posición" : "Crear Posición"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la Posición *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="evaluation_criteria">Criterios de Evaluación *</Label>
            <Textarea
              id="evaluation_criteria"
              value={formData.evaluation_criteria}
              onChange={(e) => setFormData({ ...formData, evaluation_criteria: e.target.value })}
              rows={4}
              className={errors.evaluation_criteria ? "border-destructive" : ""}
            />
            {errors.evaluation_criteria && <p className="text-xs text-destructive mt-1">{errors.evaluation_criteria}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="work_mode">Modalidad de Trabajo</Label>
              <Select value={formData.work_mode} onValueChange={(value) => setFormData({ ...formData, work_mode: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remoto</SelectItem>
                  <SelectItem value="Hybrid">Híbrido</SelectItem>
                  <SelectItem value="On-site">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="threshold">Umbral de Score LLM (0-1)</Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.llm_score_threshold}
              onChange={(e) => setFormData({ ...formData, llm_score_threshold: parseFloat(e.target.value) })}
              className={errors.llm_score_threshold ? "border-destructive" : ""}
            />
            {errors.llm_score_threshold && <p className="text-xs text-destructive mt-1">{errors.llm_score_threshold}</p>}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="is_open"
                checked={formData.is_open}
                onCheckedChange={(checked) => setFormData({ ...formData, is_open: checked })}
              />
              <Label htmlFor="is_open">Posición Abierta</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Activa</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-ff-primary hover:bg-ff-secondary"
            >
              {loading ? "Guardando..." : (jobPosition ? "Actualizar" : "Crear")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}