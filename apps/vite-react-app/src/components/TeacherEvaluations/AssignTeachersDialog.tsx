import React, { useState, useEffect } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { CheckCircle, Clock, Users, Calendar } from 'lucide-react';
import { Period } from '@/services/periods/types';
import { User } from '@/services/users/types';
import { periodService, userService, teacherEvaluationService } from '@/services';

interface AssignTeachersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface AssignmentData {
  period_id: number;
  teacher_ids: number[];
  evaluator_id: number;
}

const AssignTeachersDialog: React.FC<AssignTeachersDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  
  const [periods, setPeriods] = useState<Period[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [evaluators, setEvaluators] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Form state
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      resetForm();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      const [periodsResponse, usersResponse] = await Promise.all([
        periodService.getPeriods({ is_active: true }),
        userService.getUsers({ size: 1000 }) // Get all users for selection
      ]);

      setPeriods(periodsResponse.items || []);
      
      const allUsers = usersResponse.items || [];
      const teacherUsers = allUsers.filter(user => user.roles.includes('guru'));
      const evaluatorUsers = allUsers.filter(user => 
        user.roles.includes('kepala_sekolah') || user.roles.includes('admin')
      );
      
      setTeachers(teacherUsers);
      setEvaluators(evaluatorUsers);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setSelectedPeriod('');
    setSelectedTeachers([]);
    setSelectedEvaluator('');
  };

  const handleTeacherToggle = (teacherId: number) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSelectAllTeachers = () => {
    if (selectedTeachers.length === teachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map(teacher => teacher.id));
    }
  };

  const handleSubmit = async () => {
    if (!selectedPeriod || selectedTeachers.length === 0 || !selectedEvaluator) {
      toast({
        title: 'Data Tidak Lengkap',
        description: 'Silakan pilih periode, guru, dan evaluator.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      const assignmentData: AssignmentData = {
        period_id: Number(selectedPeriod),
        teacher_ids: selectedTeachers,
        evaluator_id: Number(selectedEvaluator),
      };

      await teacherEvaluationService.assignTeachersToPeriod(assignmentData);

      toast({
        title: 'Berhasil',
        description: `${selectedTeachers.length} guru berhasil ditugaskan untuk evaluasi.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error assigning teachers:', error);
      const errorMessage = error?.message || 'Gagal menugaskan guru. Silakan coba lagi.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPeriodData = periods.find(p => p.id === Number(selectedPeriod));
  const selectedEvaluatorData = evaluators.find(e => e.id === Number(selectedEvaluator));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Teachers to Period
          </DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Period Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Select Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="period-select">Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger id="period-select">
                      <SelectValue placeholder="Pilih periode evaluasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{period.academic_year} - {period.semester}</span>
                            {period.is_active && (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPeriodData && (
                    <div className="text-sm text-muted-foreground">
                      {new Date(selectedPeriodData.start_date).toLocaleDateString('id-ID')} - {' '}
                      {new Date(selectedPeriodData.end_date).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Evaluator Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-4 w-4" />
                  Select Evaluator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="evaluator-select">Evaluator</Label>
                  <Select value={selectedEvaluator} onValueChange={setSelectedEvaluator}>
                    <SelectTrigger id="evaluator-select">
                      <SelectValue placeholder="Pilih evaluator" />
                    </SelectTrigger>
                    <SelectContent>
                      {evaluators.map((evaluator) => (
                        <SelectItem key={evaluator.id} value={evaluator.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{evaluator.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {evaluator.roles.includes('kepala_sekolah') ? 'Kepala Sekolah' : 'Admin'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedEvaluatorData && (
                    <div className="text-sm text-muted-foreground">
                      {selectedEvaluatorData.email}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teacher Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Select Teachers ({selectedTeachers.length} selected)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Select All Toggle */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedTeachers.length === teachers.length && teachers.length > 0}
                      onCheckedChange={handleSelectAllTeachers}
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium">
                      Select All Teachers ({teachers.length})
                    </Label>
                  </div>

                  <Separator />

                  {/* Teacher List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`teacher-${teacher.id}`}
                          checked={selectedTeachers.includes(teacher.id)}
                          onCheckedChange={() => handleTeacherToggle(teacher.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <Label 
                            htmlFor={`teacher-${teacher.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {teacher.full_name}
                          </Label>
                          <div className="text-xs text-muted-foreground truncate">
                            {teacher.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {teachers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada guru yang tersedia</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {selectedPeriod && selectedEvaluator && selectedTeachers.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Assignment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Period:</span> {selectedPeriodData?.academic_year} - {selectedPeriodData?.semester}
                    </div>
                    <div>
                      <span className="font-medium">Evaluator:</span> {selectedEvaluatorData?.full_name}
                    </div>
                    <div>
                      <span className="font-medium">Teachers:</span> {selectedTeachers.length} guru dipilih
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || loadingData || !selectedPeriod || selectedTeachers.length === 0 || !selectedEvaluator}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Assigning...
              </>
            ) : (
              `Assign ${selectedTeachers.length} Teachers`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTeachersDialog;