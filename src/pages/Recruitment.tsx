import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Search, Eye, UserCheck } from "lucide-react";

export default function Recruitment() {
  const [searchTerm, setSearchTerm] = useState("");

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
            llm_score,
            llm_evaluation,
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

  const filteredProspects = prospects?.filter(prospect =>
    prospect.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prospect.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prospects..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Evaluations</TableHead>
                    <TableHead>Best Score</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProspects?.map((prospect) => {
                    const evaluations = prospect.prospect_evaluation || [];
                    const bestScore = evaluations.length > 0 
                      ? Math.max(...evaluations.map(e => e.llm_score || 0))
                      : 0;
                    
                    return (
                      <TableRow key={prospect.id}>
                        <TableCell className="font-medium">
                          {prospect.name}
                        </TableCell>
                        <TableCell>{prospect.agent?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {evaluations.length} evaluations
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {bestScore > 0 && (
                            <Badge variant={bestScore >= 0.7 ? "default" : "secondary"}>
                              {(bestScore * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{prospect.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {prospect.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(prospect.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
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
      </Tabs>
    </div>
  );
}