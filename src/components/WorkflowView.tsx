import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Eye, ArrowUpAz, ArrowDownAz } from "lucide-react";

export const WorkflowView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Query para obtener todos los datos del flujo de trabajo
  const { data: workflowData, isLoading } = useQuery({
    queryKey: ["workflow-data"],
    queryFn: async () => {
      // Obtener prospectos con sus evaluaciones
      const { data: prospects, error: prospectsError } = await supabase
        .from("prospect")
        .select(`
          id,
          name,
          email,
          created_at,
          prospect_evaluation(
            id,
            llm_score,
            created_at,
            job_position:job_position_id(id, name)
          )
        `);

      if (prospectsError) throw prospectsError;

      // Obtener candidatos con sus procesos
      const { data: candidates, error: candidatesError } = await supabase
        .from("candidate")
        .select(`
          id,
          name,
          email,
          created_at,
          candidate_process(
            id,
            status,
            last_score,
            start_date,
            end_date,
            job_position:job_position_id(id, name)
          )
        `);

      if (candidatesError) throw candidatesError;

      // Obtener todas las posiciones laborales para el filtro
      const { data: positions, error: positionsError } = await supabase
        .from("job_position")
        .select("id, name")
        .order("name");

      if (positionsError) throw positionsError;

      // Combinar datos y crear registros de flujo de trabajo
      const workflowItems: any[] = [];

      // Agregar prospectos
      prospects?.forEach(prospect => {
        if (prospect.prospect_evaluation && prospect.prospect_evaluation.length > 0) {
          prospect.prospect_evaluation.forEach((evaluation: any) => {
            workflowItems.push({
              id: `prospect-${prospect.id}-${evaluation.id}`,
              type: 'prospect',
              person_id: prospect.id,
              person_name: prospect.name,
              person_email: prospect.email,
              position_id: evaluation.job_position?.id,
              position_name: evaluation.job_position?.name,
              stage: 'Prospecto - Evaluado',
              score: evaluation.llm_score,
              updated_at: evaluation.created_at,
              status: evaluation.llm_score >= 70 ? 'high' : evaluation.llm_score >= 45 ? 'medium' : 'low'
            });
          });
        } else {
          workflowItems.push({
            id: `prospect-${prospect.id}`,
            type: 'prospect',
            person_id: prospect.id,
            person_name: prospect.name,
            person_email: prospect.email,
            position_id: null,
            position_name: 'Sin evaluar',
            stage: 'Prospecto - Sin evaluar',
            score: null,
            updated_at: prospect.created_at,
            status: 'pending'
          });
        }
      });

      // Agregar candidatos
      candidates?.forEach(candidate => {
        if (candidate.candidate_process && candidate.candidate_process.length > 0) {
          candidate.candidate_process.forEach((process: any) => {
            workflowItems.push({
              id: `candidate-${candidate.id}-${process.id}`,
              type: 'candidate',
              person_id: candidate.id,
              person_name: candidate.name,
              person_email: candidate.email,
              position_id: process.job_position?.id,
              position_name: process.job_position?.name,
              stage: `Candidato - ${process.status || 'En progreso'}`,
              score: process.last_score ? process.last_score * 100 : null,
              updated_at: process.end_date || process.start_date,
              status: process.status === 'completed' ? 'completed' : 'in_progress'
            });
          });
        }
      });

      return { workflowItems, positions };
    },
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ArrowUpAz className="h-4 w-4" /> : <ArrowDownAz className="h-4 w-4" />;
  };

  const getStageColor = (stage: string, status: string) => {
    if (stage.includes('Sin evaluar') || status === 'pending') return "bg-gray-200 text-gray-800";
    if (stage.includes('Prospecto')) {
      if (status === 'high') return "bg-green-200 text-green-800";
      if (status === 'medium') return "bg-yellow-200 text-yellow-800";
      if (status === 'low') return "bg-red-200 text-red-800";
    }
    if (stage.includes('Candidato')) {
      if (status === 'completed') return "bg-blue-200 text-blue-800";
      return "bg-purple-200 text-purple-800";
    }
    return "bg-gray-200 text-gray-800";
  };

  const filteredAndSortedItems = workflowData?.workflowItems
    ?.filter(item => {
      const matchesSearch = 
        item.person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.person_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = stageFilter === "all" || 
        (stageFilter === "prospect" && item.type === "prospect") ||
        (stageFilter === "candidate" && item.type === "candidate");
      
      const matchesPosition = positionFilter === "all" || item.position_id === positionFilter;
      
      return matchesSearch && matchesStage && matchesPosition;
    })
    ?.sort((a, b) => {
      const getValue = (obj: any, field: string) => {
        switch (field) {
          case "person_name": return obj.person_name || "";
          case "position_name": return obj.position_name || "";
          case "stage": return obj.stage || "";
          case "score": return obj.score || 0;
          case "updated_at": return obj.updated_at || "";
          default: return "";
        }
      };
      
      const aVal = getValue(a, sortField);
      const bVal = getValue(b, sortField);
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      if (sortDirection === "asc") {
        return aVal.toString().localeCompare(bVal.toString());
      } else {
        return bVal.toString().localeCompare(aVal.toString());
      }
    });

  if (isLoading) {
    return <div>Cargando vista de flujo de trabajo...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista de Flujo de Trabajo</CardTitle>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, posición o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etapas</SelectItem>
              <SelectItem value="prospect">Prospectos</SelectItem>
              <SelectItem value="candidate">Candidatos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por posición" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las posiciones</SelectItem>
              {workflowData?.positions?.map((position: any) => (
                <SelectItem key={position.id} value={position.id}>
                  {position.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("person_name")}
                  className="font-medium"
                >
                  Nombre {getSortIcon("person_name")}
                </Button>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("position_name")}
                  className="font-medium"
                >
                  Posición {getSortIcon("position_name")}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("stage")}
                  className="font-medium"
                >
                  Etapa {getSortIcon("stage")}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("score")}
                  className="font-medium"
                >
                  Puntuación {getSortIcon("score")}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("updated_at")}
                  className="font-medium"
                >
                  Última actualización {getSortIcon("updated_at")}
                </Button>
              </TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems?.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {item.person_name || 'N/A'}
                </TableCell>
                <TableCell className="text-sm">
                  {item.person_email || 'N/A'}
                </TableCell>
                <TableCell>
                  {item.position_name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge className={`${getStageColor(item.stage, item.status)} border-0`}>
                    {item.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.score !== null ? `${item.score.toFixed(1)}%` : 'N/A'}
                </TableCell>
                <TableCell>
                  {new Date(item.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};