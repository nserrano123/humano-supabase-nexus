import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserCheck, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: candidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: jobPositions } = useQuery({
    queryKey: ["job-positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_position")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: applications } = useQuery({
    queryKey: ["job-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: prospects } = useQuery({
    queryKey: ["prospects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prospect")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    {
      title: "Total Candidates",
      value: candidates?.length || 0,
      description: "Registered candidates",
      icon: Users,
    },
    {
      title: "Open Positions",
      value: jobPositions?.filter(job => job.is_open)?.length || 0,
      description: "Currently hiring",
      icon: Briefcase,
    },
    {
      title: "Applications",
      value: applications?.length || 0,
      description: "Total applications",
      icon: UserCheck,
    },
    {
      title: "Prospects",
      value: prospects?.length || 0,
      description: "Active prospects",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your recruitment metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest job applications received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications?.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{app.full_name}</p>
                    <p className="text-xs text-muted-foreground">{app.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>Currently active job openings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobPositions?.filter(job => job.is_open).slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.department}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {job.work_mode}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}