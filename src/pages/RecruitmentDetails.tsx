import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, MapPin, Calendar } from "lucide-react";

export default function RecruitmentDetails() {
  const { jobPositionId } = useParams<{ jobPositionId: string }>();

  const { data: jobPosition, isLoading: jobLoading } = useQuery({
    queryKey: ["job-position", jobPositionId],
    queryFn: async () => {
      if (!jobPositionId) throw new Error("Job position ID is required");
      const { data, error } = await supabase
        .from("job_position")
        .select("*")
        .eq("id", jobPositionId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobPositionId,
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ["candidates-by-job", jobPositionId],
    queryFn: async () => {
      if (!jobPositionId) throw new Error("Job position ID is required");
      const { data, error } = await supabase
        .from("candidate_process")
        .select(`
          *,
          candidate:candidate_id (
            id,
            name,
            email,
            work_mode,
            hiring_stage,
            created_at
          )
        `)
        .eq("job_position_id", jobPositionId)
        .order("candidate(created_at)", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!jobPositionId,
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Hired":
        return "bg-green-100 text-green-800";
      case "Rejected QS":
      case "Withdrawn":
        return "bg-red-100 text-red-800";
      case "Founding Team":
        return "bg-purple-100 text-purple-800";
      case "Technical Test":
      case "Presentation":
        return "bg-yellow-100 text-yellow-800";
      case "Culture Meeting":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkModeColor = (mode: string) => {
    switch (mode) {
      case "Remote":
        return "bg-green-100 text-green-800";
      case "Hybrid":
        return "bg-yellow-100 text-yellow-800";
      case "On site":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (jobLoading || candidatesLoading) {
    return <div>Cargando detalles del proceso...</div>;
  }

  if (!jobPosition) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Posición no encontrada
        </h2>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al tablero
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{jobPosition.name}</h1>
          <p className="text-gray-600">Detalles del proceso de contratación</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Puesto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Departamento</p>
            <p className="text-sm text-gray-900">{jobPosition.department || "No especificado"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Candidatos requeridos</p>
            <p className="text-sm text-gray-900">{jobPosition.open_positions || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Candidatos contratados</p>
            <p className="text-sm text-gray-900">{jobPosition.positions_hired || 0}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Candidatos en Proceso</span>
            <Badge variant="outline">
              {candidates?.length || 0} candidatos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidates && candidates.length > 0 ? (
            <div className="space-y-4">
              {candidates.map((candidateProcess) => {
                const candidate = candidateProcess.candidate;
                if (!candidate) return null;
                
                return (
                  <div
                    key={candidateProcess.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900">
                          {candidate.name || "Nombre no disponible"}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{candidate.email || "No disponible"}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(candidate.created_at).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStageColor(candidate.hiring_stage || "")}>
                          {candidate.hiring_stage || "Sin etapa"}
                        </Badge>
                        
                        {candidate.work_mode && (
                          <Badge 
                            variant="outline" 
                            className={getWorkModeColor(candidate.work_mode)}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {candidate.work_mode}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay candidatos en proceso para esta posición.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}