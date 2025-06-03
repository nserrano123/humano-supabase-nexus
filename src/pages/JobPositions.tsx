import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Plus, Edit } from "lucide-react";

export default function JobPositions() {
  const [searchTerm, setSearchTerm] = useState("");

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

  if (isLoading) {
    return <div>Loading job positions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Positions</h1>
          <p className="text-gray-600">Manage your job openings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
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
                      <Button variant="outline" size="sm">
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
    </div>
  );
}