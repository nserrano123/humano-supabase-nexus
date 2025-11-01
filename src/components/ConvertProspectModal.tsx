import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConvertProspectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: {
    id: string;
    name: string;
    email: string;
    phone: string;
    linkedin_url: string;
    status: string;
  };
  onSuccess?: () => void;
}

export default function ConvertProspectModal({
  open,
  onOpenChange,
  prospect,
  onSuccess
}: ConvertProspectModalProps) {
  const [jobPositionId, setJobPositionId] = useState<string>("");
  const [jobPositions, setJobPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [duplicate, setDuplicate] = useState<{ exists: boolean; candidateId?: string }>({
    exists: false
  });
  const [showDuplicateOptions, setShowDuplicateOptions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchJobPositions();
      setDuplicate({ exists: false });
      setShowDuplicateOptions(false);
    }
  }, [open]);

  const fetchJobPositions = async () => {
    const { data, error } = await supabase
      .from("job_position")
      .select("id, name, department, work_mode")
      .eq("is_open", true)
      .eq("active", true)
      .order("name");

    if (error) {
      console.error("Error fetching job positions:", error);
    } else {
      setJobPositions(data || []);
    }
  };

  const handleConvert = async (overrideDuplicate: boolean = false) => {
    if (!prospect.email) {
      toast.error("El prospecto debe tener un email para ser convertido");
      return;
    }

    if (prospect.status === 'converted') {
      toast.error("Este prospecto ya ha sido convertido");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('convert_prospect_to_candidate', {
        p_prospect_id: prospect.id,
        p_job_position_id: jobPositionId || null,
        p_override_duplicate: overrideDuplicate
      });

      if (error) throw error;

      const result = data as { success: boolean; duplicate: boolean; existing_candidate_id?: string; candidate_id?: string; message?: string };

      if (result.duplicate && !overrideDuplicate) {
        setDuplicate({
          exists: true,
          candidateId: result.existing_candidate_id
        });
        setShowDuplicateOptions(true);
        setLoading(false);
        return;
      }

      toast.success(result.message || "Prospecto convertido exitosamente");
      onSuccess?.();
      onOpenChange(false);
      
      // Redirect to candidate detail
      if (result.candidate_id) {
        setTimeout(() => {
          navigate(`/candidates/${result.candidate_id}`);
        }, 500);
      }
    } catch (error: any) {
      console.error("Error converting prospect:", error);
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-ff-primary">
            <UserPlus className="h-5 w-5" />
            Convertir a Candidato
          </DialogTitle>
          <DialogDescription>
            Convertir este prospecto en un candidato activo en el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prospect Data Preview */}
          <div className="rounded-lg border border-ff-border bg-ff-muted/50 p-4 space-y-2">
            <h4 className="font-medium text-sm text-ff-foreground">Datos a copiar:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{prospect.name || 'Sin nombre'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{prospect.email || 'Sin email'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="font-medium">{prospect.phone || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>

          {/* Duplicate Warning */}
          {showDuplicateOptions && duplicate.exists && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>Ya existe un candidato con este email.</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (duplicate.candidateId) {
                        navigate(`/candidates/${duplicate.candidateId}`);
                        onOpenChange(false);
                      }
                    }}
                  >
                    Ver candidato existente
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleConvert(true)}
                    disabled={loading}
                  >
                    Vincular al existente
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Job Position Selection */}
          {!showDuplicateOptions && (
            <div className="space-y-2">
              <Label htmlFor="job-position">
                Asociar a posición (opcional)
              </Label>
              <Select value={jobPositionId} onValueChange={setJobPositionId}>
                <SelectTrigger id="job-position">
                  <SelectValue placeholder="Seleccionar posición..." />
                </SelectTrigger>
                <SelectContent>
                  {jobPositions.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.name} - {job.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Si seleccionas una posición, se creará una postulación automáticamente
              </p>
            </div>
          )}

          {/* Success Info */}
          {!showDuplicateOptions && (
            <Alert className="border-ff-success bg-ff-success/10">
              <CheckCircle2 className="h-4 w-4 text-ff-success" />
              <AlertDescription className="text-sm">
                <strong>Qué sucederá:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Se creará un nuevo candidato con estos datos</li>
                  <li>• El prospecto se marcará como 'convertido'</li>
                  {jobPositionId && <li>• Se creará una postulación a la posición seleccionada</li>}
                  <li>• Se registrará la actividad en el historial</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {!showDuplicateOptions && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleConvert(false)}
              disabled={loading || !prospect.email}
              className="bg-ff-primary hover:bg-ff-secondary"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Convirtiendo...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convertir a Candidato
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}