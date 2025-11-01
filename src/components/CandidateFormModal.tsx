import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const candidateSchema = z.object({
  name: z.string().min(1, "Nombre es requerido").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().max(20).optional(),
  linkedin_url: z.string().url("URL inválida").optional().or(z.literal("")),
  status: z.enum(['new', 'in_process', 'hired', 'rejected'])
});

interface CandidateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: any;
  onSuccess?: () => void;
}

export default function CandidateFormModal({
  open,
  onOpenChange,
  candidate,
  onSuccess
}: CandidateFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    status: "new"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        linkedin_url: candidate.linkedin_url || "",
        status: candidate.status || "new"
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        linkedin_url: "",
        status: "new"
      });
    }
    setErrors({});
  }, [candidate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      candidateSchema.parse(formData);
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
      if (candidate) {
        // Update
        const { error } = await supabase
          .from('candidate')
          .update({
            ...formData,
            linkedin_url: formData.linkedin_url || null,
            phone: formData.phone || null
          })
          .eq('id', candidate.id);

        if (error) throw error;
        toast.success("Candidato actualizado correctamente");
      } else {
        // Create
        const { error } = await supabase
          .from('candidate')
          .insert({
            ...formData,
            linkedin_url: formData.linkedin_url || null,
            phone: formData.phone || null
          });

        if (error) throw error;
        toast.success("Candidato creado correctamente");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving candidate:", error);
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-ff-primary">
            {candidate ? "Editar Candidato" : "Crear Candidato"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className={errors.linkedin_url ? "border-destructive" : ""}
            />
            {errors.linkedin_url && <p className="text-xs text-destructive mt-1">{errors.linkedin_url}</p>}
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="in_process">En Proceso</SelectItem>
                <SelectItem value="hired">Contratado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Guardando..." : (candidate ? "Actualizar" : "Crear")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}