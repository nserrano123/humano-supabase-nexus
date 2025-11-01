import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, UserPlus, Users, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import ConvertProspectModal from "./ConvertProspectModal";
import ProspectFormModal from "./ProspectFormModal";

interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  profile_text: string;
  profile_json: any;
  created_at: string;
  status: string;
}

const ProspectList: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const { data, error } = await supabase
        .from('prospect')
        .select('id, name, email, phone, linkedin_url, profile_text, profile_json, created_at, status')
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

  const handleOpenConvertModal = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setConvertModalOpen(true);
  };

  const handleOpenEditModal = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setFormModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingProspect(null);
    setFormModalOpen(true);
  };

  const handleDeleteProspect = async (prospectId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este prospecto?')) return;

    try {
      const { error } = await supabase
        .from('prospect')
        .delete()
        .eq('id', prospectId);

      if (error) throw error;

      toast.success('Prospecto eliminado correctamente');
      fetchProspects();
    } catch (error: any) {
      console.error('Error deleting prospect:', error);
      toast.error(`Error al eliminar prospecto: ${error.message || 'Error desconocido'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'new': { variant: 'default', label: 'Nuevo' },
      'contacted': { variant: 'secondary', label: 'Contactado' },
      'qualified': { variant: 'outline', label: 'Calificado' },
      'converted': { variant: 'outline', label: 'Convertido' },
      'archived': { variant: 'destructive', label: 'Archivado' }
    };
    const config = variants[status] || variants['new'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ff-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando prospectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-ff-primary" />
          <div>
            <h1 className="text-3xl font-bold text-ff-primary">Lista de Prospectos</h1>
            <p className="text-muted-foreground">
              Gestiona y convierte prospectos en candidatos
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreateModal} className="bg-ff-primary hover:bg-ff-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Crear Prospecto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-ff-primary">
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
                  <TableRow className="bg-ff-primary">
                    <TableHead className="text-white font-semibold">Nombre</TableHead>
                    <TableHead className="text-white font-semibold">Email</TableHead>
                    <TableHead className="text-white font-semibold">Teléfono</TableHead>
                    <TableHead className="text-white font-semibold">LinkedIn</TableHead>
                    <TableHead className="text-white font-semibold">Estado</TableHead>
                    <TableHead className="text-white font-semibold">Fecha</TableHead>
                    <TableHead className="text-white font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prospects.map((prospect) => (
                    <TableRow 
                      key={prospect.id}
                      className="hover:bg-ff-neutral transition-colors"
                    >
                      <TableCell className="font-medium">
                        {prospect.name || prospect.profile_json?.name || 'Sin nombre'}
                      </TableCell>
                      <TableCell>
                        {prospect.email || prospect.profile_json?.email || 'Sin email'}
                      </TableCell>
                      <TableCell>
                        {prospect.phone || prospect.profile_json?.phone || 'Sin teléfono'}
                      </TableCell>
                      <TableCell>
                        {prospect.linkedin_url ? (
                          <a
                            href={prospect.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ff-accent hover:underline inline-flex items-center gap-1"
                          >
                            Ver perfil
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Sin LinkedIn</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(prospect.status || 'new')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(prospect.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {prospect.status === 'converted' ? (
                            <Badge className="bg-ff-success text-white">
                              <Eye className="h-3 w-3 mr-1" />
                              Convertido
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditModal(prospect)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenConvertModal(prospect)}
                                className="bg-ff-accent hover:bg-ff-secondary text-white"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Convertir
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProspect(prospect.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
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

      {selectedProspect && (
        <ConvertProspectModal
          open={convertModalOpen}
          onOpenChange={setConvertModalOpen}
          prospect={selectedProspect}
          onSuccess={fetchProspects}
        />
      )}

      <ProspectFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        prospect={editingProspect}
        onSuccess={fetchProspects}
      />
    </div>
  );
};

export default ProspectList;