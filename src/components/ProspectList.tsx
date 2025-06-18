import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  created_at: string;
}

const ProspectList: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertingIds, setConvertingIds] = useState<Set<string>>(new Set());
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const { data, error } = await supabase
        .from('prospect')
        .select('id, name, email, phone, linkedin_url, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProspects(data || []);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast.error('Error al cargar prospectos');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToCandidate = async (prospectId: string) => {
    setConvertingIds(prev => new Set(prev).add(prospectId));

    try {
      const { error } = await supabase.rpc('insert_candidate_from_prospect_fn' as any, {
        prospect_id: prospectId
      });

      if (error) throw error;

      setConvertedIds(prev => new Set(prev).add(prospectId));
      toast.success('Prospecto convertido a candidato exitosamente');
    } catch (error: any) {
      console.error('Error converting prospect:', error);
      toast.error(`Error al convertir prospecto: ${error.message || 'Error desconocido'}`);
    } finally {
      setConvertingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(prospectId);
        return newSet;
      });
    }
  };

  const isConverting = (id: string) => convertingIds.has(id);
  const isConverted = (id: string) => convertedIds.has(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando prospectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-[#1E3A8A]" />
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A8A]">Lista de Prospectos</h1>
          <p className="text-muted-foreground">
            Gestiona y convierte prospectos en candidatos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1E3A8A]">
            Prospectos Disponibles ({prospects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prospects.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No se encontraron prospectos
              </h3>
              <p className="text-sm text-muted-foreground">
                No hay prospectos disponibles para mostrar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1E3A8A]">
                    <TableHead className="text-white font-semibold">Nombre</TableHead>
                    <TableHead className="text-white font-semibold">Email</TableHead>
                    <TableHead className="text-white font-semibold">Teléfono</TableHead>
                    <TableHead className="text-white font-semibold">LinkedIn</TableHead>
                    <TableHead className="text-white font-semibold">Fecha</TableHead>
                    <TableHead className="text-white font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prospects.map((prospect) => (
                    <TableRow 
                      key={prospect.id}
                      className="hover:bg-[#F3F4F6] transition-colors"
                    >
                      <TableCell className="font-medium">
                        {prospect.name || 'Sin nombre'}
                      </TableCell>
                      <TableCell>
                        {prospect.email || 'Sin email'}
                      </TableCell>
                      <TableCell>
                        {prospect.phone || 'Sin teléfono'}
                      </TableCell>
                      <TableCell>
                        {prospect.linkedin_url ? (
                          <a
                            href={prospect.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F59E0B] hover:underline inline-flex items-center gap-1"
                          >
                            Ver perfil
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Sin LinkedIn</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(prospect.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {isConverted(prospect.id) ? (
                            <Badge className="bg-[#10B981] text-white">
                              Convertido
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleConvertToCandidate(prospect.id)}
                              disabled={isConverting(prospect.id)}
                              className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium"
                            >
                              {isConverting(prospect.id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <UserPlus className="h-4 w-4 mr-2" />
                              )}
                              {isConverting(prospect.id) ? 'Convirtiendo...' : 'Convertir a Candidato'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProspectList;