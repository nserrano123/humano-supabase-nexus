import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Plus, Upload, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EventModal } from "@/components/EventModal";

export default function CandidateDetails() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [showEventModal, setShowEventModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate-details", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("Candidate ID is required");
      const { data, error } = await supabase
        .from("candidate")
        .select(`
          *,
          city:city_id(name),
          candidate_education(
            id,
            program:program_id(name, company:company_id(name)),
            start_date,
            end_date,
            is_current,
            is_completed
          ),
          experience(
            id,
            job_title,
            company:company_id(name),
            description,
            start_date,
            end_date,
            is_current,
            work_mode
          ),
          candidate_process(
            id,
            job_position:job_position_id(name),
            hiring_stage,
            start_date,
            end_date,
            last_score
          )
        `)
        .eq("id", candidateId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!candidateId,
  });

  const { data: events } = useQuery({
    queryKey: ["candidate-events", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("Candidate ID is required");
      const { data, error } = await supabase
        .from("evento")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!candidateId,
  });

  const uploadCVMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!candidateId) throw new Error("Candidate ID is required");
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${candidateId}/cv.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('candidate-cvs')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { error: updateError } = await supabase
        .from('candidate')
        .update({ cv_file_path: fileName })
        .eq('id', candidateId);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-details", candidateId] });
      toast.success("CV subido correctamente");
    },
    onError: (error) => {
      toast.error("Error al subir CV: " + error.message);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Solo se permiten archivos PDF");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("El archivo no puede ser mayor a 5MB");
        return;
      }
      uploadCVMutation.mutate(file);
    }
  };

  const downloadCV = async () => {
    if (!candidate?.cv_file_path) return;
    
    const { data, error } = await supabase.storage
      .from('candidate-cvs')
      .download(candidate.cv_file_path);
    
    if (error) {
      toast.error("Error al descargar CV");
      return;
    }
    
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${candidate.name}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  if (isLoading) {
    return <div>Cargando detalles del candidato...</div>;
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Candidato no encontrado
        </h2>
        <Link to="/candidates">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a candidatos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/candidates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
          <p className="text-gray-600">Información detallada del candidato</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{candidate.email || "No disponible"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{candidate.phone || "No disponible"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{candidate.city?.name || "No especificada"}</span>
            </div>
            {candidate.work_mode && (
              <Badge variant="outline">{candidate.work_mode}</Badge>
            )}
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado Actual</CardTitle>
          </CardHeader>
          <CardContent>
            {candidate.hiring_stage ? (
              <Badge className={getStageColor(candidate.hiring_stage)}>
                {candidate.hiring_stage}
              </Badge>
            ) : (
              <span className="text-gray-500">Sin proceso activo</span>
            )}
          </CardContent>
        </Card>

        {/* CV Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Hoja de Vida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload">
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir CV (PDF)
                  </span>
                </Button>
              </label>
              {candidate.cv_file_path && (
                <Button
                  variant="outline"
                  onClick={downloadCV}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="processes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="processes">Procesos</TabsTrigger>
          <TabsTrigger value="experience">Experiencia</TabsTrigger>
          <TabsTrigger value="education">Educación</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="processes">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Procesos</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.candidate_process && candidate.candidate_process.length > 0 ? (
                <div className="space-y-4">
                  {candidate.candidate_process.map((process) => (
                    <div key={process.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{process.job_position?.name}</h3>
                          <p className="text-sm text-gray-600">
                            Inicio: {new Date(process.start_date).toLocaleDateString()}
                            {process.end_date && (
                              <span> - Fin: {new Date(process.end_date).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStageColor(process.hiring_stage || "")}>
                            {process.hiring_stage || "Sin etapa"}
                          </Badge>
                          {process.last_score && (
                            <span className="text-sm text-gray-600">
                              Score: {process.last_score}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay procesos registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Experiencia Laboral</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.experience && candidate.experience.length > 0 ? (
                <div className="space-y-4">
                  {candidate.experience.map((exp) => (
                    <div key={exp.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{exp.job_title}</h3>
                          <p className="text-sm text-gray-600">{exp.company?.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(exp.start_date).toLocaleDateString()} - 
                            {exp.is_current ? " Actual" : ` ${new Date(exp.end_date).toLocaleDateString()}`}
                          </p>
                          {exp.description && (
                            <p className="text-sm mt-2">{exp.description}</p>
                          )}
                        </div>
                        {exp.work_mode && (
                          <Badge variant="outline">{exp.work_mode}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay experiencia registrada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Educación</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.candidate_education && candidate.candidate_education.length > 0 ? (
                <div className="space-y-4">
                  {candidate.candidate_education.map((edu) => (
                    <div key={edu.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{edu.program?.name}</h3>
                      <p className="text-sm text-gray-600">{edu.program?.company?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(edu.start_date).toLocaleDateString()} - 
                        {edu.is_current ? " En curso" : ` ${new Date(edu.end_date).toLocaleDateString()}`}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={edu.is_completed ? "default" : "secondary"}>
                          {edu.is_completed ? "Completado" : "En curso"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay educación registrada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Eventos</CardTitle>
                <Button onClick={() => setShowEventModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Evento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{event.type || "Evento"}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.created_at).toLocaleString()}</span>
                          </div>
                          {event.note && (
                            <p className="text-sm mt-2 text-gray-700">{event.note}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay eventos registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showEventModal && (
        <EventModal
          candidateId={candidateId!}
          onClose={() => setShowEventModal(false)}
          onSuccess={() => {
            setShowEventModal(false);
            queryClient.invalidateQueries({ queryKey: ["candidate-events", candidateId] });
          }}
        />
      )}
    </div>
  );
}