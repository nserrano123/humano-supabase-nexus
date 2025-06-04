import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Evaluation {
  id: string;
  llm_score: number;
  llm_evaluation: string;
  created_at: string;
  job_position: {
    name: string;
  };
}

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluations: Evaluation[];
  prospectName: string;
}

export const EvaluationModal = ({ isOpen, onClose, evaluations, prospectName }: EvaluationModalProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-200 text-green-800";
    if (score >= 45) return "bg-yellow-200 text-yellow-800";
    return "bg-red-200 text-red-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluaciones de {prospectName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {evaluations.length === 0 ? (
            <p className="text-muted-foreground">No hay evaluaciones para este prospecto.</p>
          ) : (
            evaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {evaluation.job_position?.name || 'Posición no especificada'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getScoreColor(evaluation.llm_score || 0)} border-0`}>
                        {evaluation.llm_score ? `${evaluation.llm_score.toFixed(1)}%` : 'N/A'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(evaluation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {evaluation.llm_evaluation || 'No hay evaluación disponible'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};