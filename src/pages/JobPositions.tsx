import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import JobPositionFormModal from "@/components/JobPositionFormModal";

export default function JobPositions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: jobPositions, isLoading } = useQuery({
    queryKey: ["job-positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_position")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: applicationCounts } = useQuery({
    queryKey: ["application-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("job_position_id")
        .then(result => {
          if (result.error) throw result.error;
          const counts: { [key: string]: number } = {};
          result.data?.forEach(app => {
            counts[app.job_position_id] = (counts[app.job_position_id] || 0) + 1;
          });
          return counts;
        });
      if (error) throw error;
      return data;
    },
  });

  const filteredJobPositions = jobPositions?.filter(job =>
    job.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deletePositionsMutation = useMutation({
    mutationFn: async (positionIds: string[]) => {
      const { error } = await supabase
        .from("job_position")
        .delete()
        .in("id", positionIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-positions"] });
      setSelectedPositions([]);
      toast.success("Posiciones eliminadas correctamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar posiciones: " + error.message);
    },
  });

  const handleSelectPosition = (positionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPositions([...selectedPositions, positionId]);
    } else {
      setSelectedPositions(selectedPositions.filter(id => id !== positionId));
    }
  };

  const handleSelectAllPositions = (checked: boolean) => {
    if (checked) {
      setSelectedPositions(filteredJobPositions?.map(p => p.id) || []);
    } else {
      setSelectedPositions([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPositions.length > 0) {
      deletePositionsMutation.mutate(selectedPositions);
    }
  };

  if (isLoading) {
    return <div>Loading job positions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ff-primary">Job Positions</h1>
          <p className="text-muted-foreground">Manage your job openings</p>
        </div>
        <Button onClick={() => { setEditingPosition(null); setFormModalOpen(true); }} className="bg-ff-primary hover:bg-ff-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedPositions.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deletePositionsMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar ({selectedPositions.length})
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
                    checked={selectedPositions.length === filteredJobPositions?.length && filteredJobPositions.length > 0}
                    onCheckedChange={handleSelectAllPositions}
                  />
                </TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Work Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Score Threshold</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobPositions?.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPositions.includes(job.id)}
                      onCheckedChange={(checked) => handleSelectPosition(job.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.description?.substring(0, 100)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.work_mode}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.is_open ? "default" : "outline"}>
                      {job.is_open ? "Open" : "Closed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {applicationCounts?.[job.id] || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.llm_score_threshold}</TableCell>
                  <TableCell>
                    {new Date(job.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => { setEditingPosition(job); setFormModalOpen(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <JobPositionFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        jobPosition={editingPosition}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["job-positions"] })}
      />
    </div>
  );
}