import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Users, Target, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { data: activeJobPositions, isLoading } = useQuery({
    queryKey: ["active-job-positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_position")
        .select("*")
        .eq("is_open", true)
        .eq("active", true)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No definida";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (isLoading) {
    return <div>Cargando procesos de contratación...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tablero de Contratación</h1>
        <p className="text-gray-600">Procesos de contratación activos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeJobPositions?.map((jobPosition) => (
          <Card key={jobPosition.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{jobPosition.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Inicio: {formatDate(jobPosition.start_date)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="h-4 w-4" />
                <span>Candidatos requeridos: {jobPosition.open_positions || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Candidatos contratados:</span>
                </div>
                
                {(jobPosition.positions_hired || 0) > 0 ? (
                  <Link to={`/recruitment-details/${jobPosition.id}`}>
                    <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                      {jobPosition.positions_hired || 0}
                    </Button>
                  </Link>
                ) : (
                  <Button variant="link" className="p-0 h-auto text-gray-400 cursor-not-allowed" disabled>
                    0
                  </Button>
                )}
              </div>
              
              {(jobPosition.positions_hired || 0) === 0 && (
                <p className="text-xs text-gray-500 italic">Sin contratados</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!activeJobPositions?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay procesos de contratación activos
            </h3>
            <p className="text-gray-600">
              No se encontraron posiciones abiertas y activas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}