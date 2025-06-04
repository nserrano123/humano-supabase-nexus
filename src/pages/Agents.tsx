import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Search, Plus, Edit, Trash2, ArrowUpAz, ArrowDownAz } from "lucide-react";
import { toast } from "sonner";

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const queryClient = useQueryClient();

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
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

  const filteredAndSortedAgents = agents
    ?.filter(agent =>
      agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a, b) => {
      const getValue = (obj: any, field: string) => {
        switch (field) {
          case "name": return obj.name || "";
          case "description": return obj.description || "";
          case "created_at": return obj.created_at || "";
          case "github_url": return obj.github_url || "";
          default: return "";
        }
      };
      
      const aVal = getValue(a, sortField);
      const bVal = getValue(b, sortField);
      
      if (sortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  const deleteAgentsMutation = useMutation({
    mutationFn: async (agentIds: string[]) => {
      const { error } = await supabase
        .from("agent")
        .delete()
        .in("id", agentIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setSelectedAgents([]);
      toast.success("Agentes eliminados correctamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar agentes: " + error.message);
    },
  });

  const handleSelectAgent = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents([...selectedAgents, agentId]);
    } else {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    }
  };

  const handleSelectAllAgents = (checked: boolean) => {
    if (checked) {
      setSelectedAgents(filteredAndSortedAgents?.map(a => a.id) || []);
    } else {
      setSelectedAgents([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedAgents.length > 0) {
      deleteAgentsMutation.mutate(selectedAgents);
    }
  };

  if (isLoading) {
    return <div>Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-600">Manage recruitment agents</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedAgents.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deleteAgentsMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar ({selectedAgents.length})
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
                    checked={selectedAgents.length === filteredAndSortedAgents?.length && filteredAndSortedAgents.length > 0}
                    onCheckedChange={handleSelectAllAgents}
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
                    onClick={() => handleSort("description")}
                    className="font-medium"
                  >
                    Description {getSortIcon("description")}
                  </Button>
                </TableHead>
                <TableHead>GitHub</TableHead>
                <TableHead>Life Period</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("created_at")}
                    className="font-medium"
                  >
                    Created {getSortIcon("created_at")}
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedAgents?.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={(checked) => handleSelectAgent(agent.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {agent.description}
                  </TableCell>
                  <TableCell>
                    {agent.github_url && (
                      <a 
                        href={agent.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        GitHub
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {agent.life_period ? "Active" : "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(agent.created_at).toLocaleDateString()}
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