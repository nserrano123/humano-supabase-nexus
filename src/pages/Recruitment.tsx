import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Search, Eye, UserCheck, Trash2, ArrowUpAz, ArrowDownAz, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { EvaluationModal } from "@/components/EvaluationModal";
import { ProspectProfileModal } from "@/components/ProspectProfileModal";
import { WorkflowView } from "@/components/WorkflowView";

export default function Recruitment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedProspectForEvaluation, setSelectedProspectForEvaluation] = useState<any>(null);
  const [selectedProspectForProfile, setSelectedProspectForProfile] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["job-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job_position:job_position_id(name, department)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: prospects, isLoading: prospectsLoading } = useQuery({
    queryKey: ["prospects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prospect")
        .select(`
          *,
          agent:agent_id(name),
          prospect_evaluation(
            id,
            llm_score,
            llm_evaluation,
            created_at,
            job_position:job_position_id(name)
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: candidateProcesses, isLoading: processesLoading } = useQuery({
    queryKey: ["candidate-processes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_process")
        .select(`
          *,
          candidate:candidate_id(name, email),
          job_position:job_position_id(name, department)
        `)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredApplications = applications?.filter(app =>
    app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const filteredAndSortedProspects = prospects
    ?.filter(prospect =>
      prospect.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.profile_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a, b) => {
      const getValue = (obj: any, field: string) => {
        switch (field) {
          case "name": return obj.name || "";
          case "agent": return obj.agent?.name || "";
          case "email": return obj.email || "";
          case "phone": return obj.phone || "";
          case "created_at": return obj.created_at || "";
          case "linkedin_url": return obj.linkedin_url || "";
          case "evaluations": return obj.prospect_evaluation?.length || 0;
          case "best_score": 
            return obj.prospect_evaluation?.length > 0 
              ? Math.max(...obj.prospect_evaluation.map((e: any) => e.llm_score || 0))
              : 0;
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

  const deleteProspectsMutation = useMutation({
    mutationFn: async (prospectIds: string[]) => {
      const { error } = await supabase
        .from("prospect")
        .delete()
        .in("id", prospectIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      setSelectedProspects([]);
      toast.success("Prospects eliminados correctamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar prospects: " + error.message);
    },
  });

  const handleSelectProspect = (prospectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProspects([...selectedProspects, prospectId]);
    } else {
      setSelectedProspects(selectedProspects.filter(id => id !== prospectId));
    }
  };

  const handleSelectAllProspects = (checked: boolean) => {
    if (checked) {
      setSelectedProspects(filteredAndSortedProspects?.map(p => p.id) || []);
    } else {
      setSelectedProspects([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProspects.length > 0) {
      deleteProspectsMutation.mutate(selectedProspects);
    }
  };

  const getBestScore = (evaluations: any[]) => {
    if (!evaluations || evaluations.length === 0) return 0;
    return Math.max(...evaluations.map((e: any) => e.llm_score || 0));
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-200 text-green-800";
    if (score >= 45) return "bg-yellow-200 text-yellow-800";
    return "bg-red-200 text-red-800";
  };

  const handleEvaluationClick = (prospect: any, evaluations: any[]) => {
    setSelectedProspectForEvaluation({ ...prospect, evaluations });
  };

  const handleViewProfile = (prospect: any) => {
    setSelectedProspectForProfile(prospect);
  };

  if (applicationsLoading || prospectsLoading || processesLoading) {
    return <div>Loading recruitment data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recruitment Process</h1>
        <p className="text-gray-600">Track applications, prospects, and candidate evaluations</p>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="processes">Active Processes</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications?.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.full_name}
                      </TableCell>
                      <TableCell>{application.job_position?.name}</TableCell>
                      <TableCell>{application.job_position?.department}</TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{application.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {application.phone_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prospects</CardTitle>
              <div className="flex items-center justify-between space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prospects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {selectedProspects.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={deleteProspectsMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar ({selectedProspects.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProspects.length === filteredAndSortedProspects?.length && filteredAndSortedProspects.length > 0}
                        onCheckedChange={handleSelectAllProspects}
                      />
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort("name")}
                        className="font-medium"
                      >
                        Name {getSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort("agent")}
                        className="font-medium"
                      >
                        Agent {getSortIcon("agent")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort("email")}
                        className="font-medium"
                      >
                        Email {getSortIcon("email")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort("phone")}
                        className="font-medium"
                      >
                        Phone {getSortIcon("phone")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort("linkedin_url")}
                        className="font-medium"
                      >
                        LinkedIn {getSortIcon("linkedin_url")}
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[200px]">Profile Text</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort("evaluations")}
                        className="font-medium"
                      >
                        Evaluations {getSortIcon("evaluations")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort("best_score")}
                        className="font-medium"
                      >
                        Best Score {getSortIcon("best_score")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort("created_at")}
                        className="font-medium"
                      >
                        Added Date {getSortIcon("created_at")}
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                 <TableBody>
                  {filteredAndSortedProspects?.map((prospect) => {
                    const evaluations = prospect.prospect_evaluation || [];
                    const bestScore = getBestScore(evaluations);
                    
                    return (
                      <TableRow key={prospect.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedProspects.includes(prospect.id)}
                            onCheckedChange={(checked) => handleSelectProspect(prospect.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium min-w-[150px]">
                          <div className="truncate" title={prospect.name}>
                            {prospect.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="truncate" title={prospect.agent?.name}>
                            {prospect.agent?.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="truncate" title={prospect.email}>
                            {prospect.email || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="truncate" title={prospect.phone}>
                            {prospect.phone || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {prospect.linkedin_url ? (
                            <a 
                              href={prospect.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
                            >
                              LinkedIn <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell className="min-w-[200px]">
                          <div 
                            className="truncate cursor-help text-sm" 
                            title={prospect.profile_text}
                            style={{ maxWidth: '200px' }}
                          >
                            {prospect.profile_text || 'No profile text'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleEvaluationClick(prospect, evaluations)}
                            className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                          >
                            {evaluations.length} evaluations
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${getScoreColor(bestScore)} border-0`}
                          >
                            {bestScore > 0 ? `${bestScore.toFixed(1)}%` : 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(prospect.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewProfile(prospect)}
                              title="Ver perfil completo"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Candidate Processes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidateProcesses?.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{process.candidate?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {process.candidate?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{process.job_position?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {process.job_position?.department}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={process.status === "active" ? "default" : "secondary"}>
                          {process.status || "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {process.last_score && (
                          <Badge variant="outline">
                            {(process.last_score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(process.start_date).toLocaleDateString()}
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
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <WorkflowView />
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <EvaluationModal
        isOpen={!!selectedProspectForEvaluation}
        onClose={() => setSelectedProspectForEvaluation(null)}
        evaluations={selectedProspectForEvaluation?.evaluations || []}
        prospectName={selectedProspectForEvaluation?.name || ''}
      />

      <ProspectProfileModal
        isOpen={!!selectedProspectForProfile}
        onClose={() => setSelectedProspectForProfile(null)}
        prospect={selectedProspectForProfile}
      />
    </div>
  );
}