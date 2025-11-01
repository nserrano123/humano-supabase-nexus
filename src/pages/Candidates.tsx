import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Search, ExternalLink, Trash2, Eye, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CandidateFormModal from "@/components/CandidateFormModal";

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate")
        .select(`
          *,
          city:city_id(name),
          candidate_education(
            program:program_id(name, company:company_id(name))
          ),
          experience(
            job_title,
            company:company_id(name),
            is_current
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  const filteredCandidates = candidates?.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteCandidatesMutation = useMutation({
    mutationFn: async (candidateIds: string[]) => {
      const { error } = await supabase
        .from("candidate")
        .delete()
        .in("id", candidateIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setSelectedCandidates([]);
      toast.success("Candidatos eliminados correctamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar candidatos: " + error.message);
    },
  });

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    } else {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    }
  };

  const handleSelectAllCandidates = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(filteredCandidates?.map(c => c.id) || []);
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCandidates.length > 0) {
      deleteCandidatesMutation.mutate(selectedCandidates);
    }
  };

  if (isLoading) {
    return <div>Loading candidates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ff-primary">Candidates</h1>
          <p className="text-muted-foreground">Manage your candidate database</p>
        </div>
        <Button onClick={() => { setEditingCandidate(null); setFormModalOpen(true); }} className="bg-ff-primary hover:bg-ff-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedCandidates.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deleteCandidatesMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar ({selectedCandidates.length})
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
                    checked={selectedCandidates.length === filteredCandidates?.length && filteredCandidates.length > 0}
                    onCheckedChange={handleSelectAllCandidates}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates?.map((candidate) => {
                const currentExperience = candidate.experience?.find(exp => exp.is_current);
                const latestEducation = candidate.candidate_education?.[0];
                
                return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={(checked) => handleSelectCandidate(candidate.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.city?.name}</TableCell>
                    <TableCell>
                      {currentExperience ? (
                        <div>
                          <div className="font-medium">{currentExperience.job_title}</div>
                          <div className="text-sm text-muted-foreground">
                            {currentExperience.company?.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {latestEducation ? (
                        <div>
                          <div className="font-medium">{latestEducation.program?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {latestEducation.program?.company?.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={candidate.applied ? "default" : "secondary"}>
                        {candidate.applied ? "Applied" : "Available"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link to={`/candidates/${candidate.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditingCandidate(candidate); setFormModalOpen(true); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {candidate.linkedin_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(candidate.linkedin_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CandidateFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        candidate={editingCandidate}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["candidates"] })}
      />
    </div>
  );
}