import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const prospectSchema = z.object({
  name: z.string().min(1, "Nombre es requerido").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().max(20).optional(),
  linkedin_url: z.string().url("URL inválida").optional().or(z.literal("")),
  profile_text: z.string().max(5000).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'archived'])
});

interface ProspectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect?: any;
  onSuccess?: () => void;
}

export default function ProspectFormModal({
  open,
  onOpenChange,
  prospect,
  onSuccess
}: ProspectFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    profile_text: "",
    status: "new"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (prospect) {
      setFormData({
        name: prospect.name || "",
        email: prospect.email || "",
        phone: prospect.phone || "",
        linkedin_url: prospect.linkedin_url || "",
        profile_text: prospect.profile_text || "",
        status: prospect.status || "new"
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        linkedin_url: "",
        profile_text: "",
        status: "new"
      });
    }
    setErrors({});
  }, [prospect, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      prospectSchema.parse(formData);
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
      // Get agent_id (you might need to fetch this or have it from context)
      const { data: agents } = await supabase.from('agent').select('id').limit(1);
      const agent_id = agents?.[0]?.id;

      if (!agent_id) {
        toast.error("No se encontró un agente disponible");
        return;
      }

      if (prospect) {
        // Update
        const { error } = await supabase
          .from('prospect')
          .update({
            ...formData,
            linkedin_url: formData.linkedin_url || null,
            phone: formData.phone || null,
            profile_text: formData.profile_text || null
          })
          .eq('id', prospect.id);

        if (error) throw error;
        toast.success("Prospecto actualizado correctamente");
      } else {
        // Create
        const { error } = await supabase
          .from('prospect')
          .insert({
            ...formData,
            agent_id,
            linkedin_url: formData.linkedin_url || null,
            phone: formData.phone || null,
            profile_text: formData.profile_text || null
          });

        if (error) throw error;
        toast.success("Prospecto creado correctamente");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving prospect:", error);
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-ff-primary">
            {prospect ? "Editar Prospecto" : "Crear Prospecto"}
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
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualified">Calificado</SelectItem>
                <SelectItem value="converted">Convertido</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="profile_text">Notas / Perfil</Label>
            <Textarea
              id="profile_text"
              value={formData.profile_text}
              onChange={(e) => setFormData({ ...formData, profile_text: e.target.value })}
              rows={4}
              className={errors.profile_text ? "border-destructive" : ""}
            />
            {errors.profile_text && <p className="text-xs text-destructive mt-1">{errors.profile_text}</p>}
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
              {loading ? "Guardando..." : (prospect ? "Actualizar" : "Crear")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}