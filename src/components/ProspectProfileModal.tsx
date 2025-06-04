import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, User, Mail, Phone, Calendar, Building } from "lucide-react";

interface ProspectProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: any;
}

export const ProspectProfileModal = ({ isOpen, onClose, prospect }: ProspectProfileModalProps) => {
  if (!prospect) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-200 text-green-800";
    if (score >= 45) return "bg-yellow-200 text-yellow-800";
    return "bg-red-200 text-red-800";
  };

  const getBestScore = (evaluations: any[]) => {
    if (!evaluations || evaluations.length === 0) return 0;
    return Math.max(...evaluations.map((e: any) => e.llm_score || 0));
  };

  const bestScore = getBestScore(prospect.prospect_evaluation);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil de {prospect.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{prospect.name || 'N/A'}</span>
              </div>
              
              {prospect.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{prospect.email}</span>
                </div>
              )}
              
              {prospect.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{prospect.phone}</span>
                </div>
              )}
              
              {prospect.agent?.name && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Agente: {prospect.agent.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Agregado: {new Date(prospect.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {prospect.linkedin_url && (
                <div className="flex items-center gap-2">
                  <a 
                    href={prospect.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Perfil de LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen de evaluaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Evaluaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de evaluaciones:</span>
                <Badge variant="outline">
                  {prospect.prospect_evaluation?.length || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mejor puntuación:</span>
                <Badge className={`${getScoreColor(bestScore)} border-0`}>
                  {bestScore > 0 ? `${bestScore.toFixed(1)}%` : 'N/A'}
                </Badge>
              </div>
              
              {prospect.prospect_evaluation && prospect.prospect_evaluation.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Posiciones evaluadas:</h4>
                  <div className="space-y-1">
                    {prospect.prospect_evaluation.map((evaluation: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span>{evaluation.job_position?.name || 'N/A'}</span>
                        <Badge 
                          className={`${getScoreColor(evaluation.llm_score || 0)} border-0 text-xs`}
                        >
                          {evaluation.llm_score ? `${evaluation.llm_score.toFixed(1)}%` : 'N/A'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Perfil de texto */}
          {prospect.profile_text && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Información del Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {prospect.profile_text}
                </p>
              </CardContent>
            </Card>
          )}

          {/* JSON del perfil (si existe) */}
          {prospect.profile_json && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Datos Completos del Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-md overflow-auto max-h-60">
                  <pre className="text-xs">
                    {JSON.stringify(prospect.profile_json, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};