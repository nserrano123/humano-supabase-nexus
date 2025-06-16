import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface EventModalProps {
  candidateId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventModal({ candidateId, onClose, onSuccess }: EventModalProps) {
  const [type, setType] = useState("");
  const [note, setNote] = useState("");

  const createEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("evento")
        .insert({
          candidate_id: candidateId,
          type: type,
          note: note.trim() || null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Evento creado correctamente");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Error al crear evento: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type.trim()) {
      toast.error("El tipo de evento es requerido");
      return;
    }
    createEventMutation.mutate();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Evento</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrevista Inicial">Entrevista Inicial</SelectItem>
                <SelectItem value="Entrevista Técnica">Entrevista Técnica</SelectItem>
                <SelectItem value="Entrevista Cultural">Entrevista Cultural</SelectItem>
                <SelectItem value="Presentación">Presentación</SelectItem>
                <SelectItem value="Reunión con Fundadores">Reunión con Fundadores</SelectItem>
                <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notas</Label>
            <Textarea
              id="note"
              placeholder="Escribe notas sobre el evento..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createEventMutation.isPending || !type.trim()}
            >
              {createEventMutation.isPending ? "Creando..." : "Crear Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}