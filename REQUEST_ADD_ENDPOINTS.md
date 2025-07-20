# REQUEST ADD ENDPOINTS - Teacher Evaluations API

## Analysis Summary

Setelah memeriksa service layer frontend (`teacher-evaluations/service.ts`) dengan dokumentasi API (`docs-api.md`), ditemukan beberapa konflik dan endpoint yang tidak ada di backend:

## Missing Endpoints di Backend

### 1. GET /teacher-evaluations (List All Evaluations)
**Frontend Function**: `getTeacherEvaluations()`  
**Expected URL**: `GET /teacher-evaluations`  
**Purpose**: List all teacher evaluations with comprehensive filtering

**Request Schema**:
```typescript
// Query Parameters
{
  page?: number;
  size?: number;
  teacher_id?: number;
  evaluator_id?: number;
  period_id?: number;
  organization_id?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'draft';
  grade?: 'A' | 'B' | 'C' | 'D';
  search?: string; // Search by teacher name or evaluator name
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Response Schema**:
```typescript
{
  items: TeacherEvaluationResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
```

### 2. GET /teacher-evaluations/my-evaluations
**Frontend Function**: `getMyEvaluations()`  
**Expected URL**: `GET /teacher-evaluations/my-evaluations`  
**Purpose**: Get evaluations for current authenticated teacher

**Request Schema**:
```typescript
// Query Parameters
{
  page?: number;
  size?: number;
  period_id?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'draft';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Response Schema**:
```typescript
{
  items: TeacherEvaluationResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
```

### 3. GET /teacher-evaluations/{id}
**Frontend Function**: `getTeacherEvaluation()`  
**Expected URL**: `GET /teacher-evaluations/{evaluation_id}`  
**Purpose**: Get single teacher evaluation by ID

**Response Schema**:
```typescript
{
  id: number;
  teacher_id: number;
  teacher: UserResponse;
  evaluator_id: number;
  evaluator: UserResponse;
  period_id: number;
  period: PeriodResponse;
  status: 'pending' | 'in_progress' | 'completed' | 'draft';
  total_score?: number;
  final_grade?: 'A' | 'B' | 'C' | 'D';
  notes?: string;
  submitted_at?: string;
  created_at: string;
  updated_at?: string;
}
```

### 4. GET /teacher-evaluations/{id}/details
**Frontend Function**: `getTeacherEvaluationDetails()`  
**Expected URL**: `GET /teacher-evaluations/{evaluation_id}/details`  
**Purpose**: Get teacher evaluation with detailed evaluation data and aspects

**Response Schema**:
```typescript
{
  // All fields from TeacherEvaluationResponse plus:
  evaluation_data: EvaluationData[];
  aspects: EvaluationAspectResponse[];
}

// Where EvaluationData is:
{
  id?: number;
  teacher_evaluation_id: number;
  aspect_id: number;
  aspect?: EvaluationAspectResponse;
  rating: 'A' | 'B' | 'C' | 'D';
  score: number; // 4, 3, 2, 1
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
```

### 5. PUT /teacher-evaluations/{id}
**Frontend Function**: `updateTeacherEvaluation()`  
**Expected URL**: `PUT /teacher-evaluations/{evaluation_id}`  
**Purpose**: Update teacher evaluation data

**Request Schema**:
```typescript
{
  evaluation_data?: EvaluationData[];
  notes?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'draft';
}
```

**Response Schema**: `TeacherEvaluationResponse`

### 6. PATCH /teacher-evaluations/{id}/draft
**Frontend Function**: `saveEvaluationDraft()`  
**Expected URL**: `PATCH /teacher-evaluations/{evaluation_id}/draft`  
**Purpose**: Save evaluation as draft

**Request Schema**:
```typescript
{
  evaluation_data?: EvaluationData[];
  notes?: string;
}
```

**Response Schema**: `TeacherEvaluationResponse`

### 7. POST /teacher-evaluations/{id}/submit
**Frontend Function**: `submitEvaluation()`  
**Expected URL**: `POST /teacher-evaluations/{evaluation_id}/submit`  
**Purpose**: Submit final evaluation

**Request Schema**:
```typescript
{
  notes?: string;
}
```

**Response Schema**: `TeacherEvaluationResponse`

### 8. POST /teacher-evaluations/assign-teachers-to-period
**Frontend Function**: `assignTeachersToPeriod()`  
**Expected URL**: `POST /teacher-evaluations/assign-teachers-to-period`  
**Purpose**: Bulk assign teachers to evaluation period

**Request Schema**:
```typescript
{
  period_id: number;
  teacher_ids: number[];
  evaluator_id: number;
}
```

**Response Schema**:
```typescript
{
  message: string;
  success: boolean;
  created_evaluations: TeacherEvaluationResponse[];
  existing_evaluations: TeacherEvaluationResponse[];
  total_assigned: number;
}
```

### 9. DELETE /teacher-evaluations/{id}
**Frontend Function**: `deleteTeacherEvaluation()`  
**Expected URL**: `DELETE /teacher-evaluations/{evaluation_id}`  
**Purpose**: Delete teacher evaluation

**Response Schema**:
```typescript
{
  message: string;
  success: boolean;
  data?: object;
}
```

### 10. GET /teacher-evaluations/stats
**Frontend Function**: `getEvaluationStats()`  
**Expected URL**: `GET /teacher-evaluations/stats`  
**Purpose**: Get evaluation statistics

**Request Schema**:
```typescript
// Query Parameters
{
  period_id?: number;
  organization_id?: number;
  teacher_id?: number;
}
```

**Response Schema**:
```typescript
{
  total_evaluations: number;
  completed_evaluations: number;
  pending_evaluations: number;
  in_progress_evaluations: number;
  average_score?: number;
  grade_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}
```

### 11. GET /teacher-evaluations/period/{period_id}
**Frontend Function**: `getEvaluationsByPeriod()`  
**Expected URL**: `GET /teacher-evaluations/period/{period_id}`  
**Purpose**: Get evaluations by specific period

**Request Schema**:
```typescript
// Query Parameters (same as getTeacherEvaluations but without period_id)
{
  page?: number;
  size?: number;
  teacher_id?: number;
  evaluator_id?: number;
  organization_id?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'draft';
  grade?: 'A' | 'B' | 'C' | 'D';
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Response Schema**: Same as `getTeacherEvaluations`

### 12. GET /teacher-evaluations/teacher/{teacher_id}
**Frontend Function**: `getEvaluationsByTeacher()`  
**Expected URL**: `GET /teacher-evaluations/teacher/{teacher_id}`  
**Purpose**: Get evaluations by specific teacher

**Request Schema**: Same as above but without teacher_id  
**Response Schema**: Same as `getTeacherEvaluations`

### 13. GET /teacher-evaluations/evaluator/{evaluator_id}
**Frontend Function**: `getEvaluationsByEvaluator()`  
**Expected URL**: `GET /teacher-evaluations/evaluator/{evaluator_id}`  
**Purpose**: Get evaluations by specific evaluator

**Request Schema**: Same as above but without evaluator_id  
**Response Schema**: Same as `getTeacherEvaluations`

### 14. PATCH /teacher-evaluations/{id}/reopen
**Frontend Function**: `reopenEvaluation()`  
**Expected URL**: `PATCH /teacher-evaluations/{evaluation_id}/reopen`  
**Purpose**: Reopen completed evaluation for editing

**Response Schema**: `TeacherEvaluationResponse`

## Issues Found

### 1. Schema Mismatch
Dokumentasi API current hanya menunjukkan endpoint sederhana untuk teacher evaluations, tapi frontend memerlukan sistem yang lebih komprehensif dengan:
- Status management (pending, in_progress, completed, draft)
- Detailed evaluation data dengan multiple aspects
- Relationship dengan User, Period, dan EvaluationAspect entities

### 2. Missing Data Structure
Frontend menggunakan data structure yang lebih kompleks:
```typescript
// Frontend expects:
TeacherEvaluation {
  teacher: User;
  evaluator: User;
  period: Period;
  status: TeacherEvaluationStatus;
  total_score?: number;
  final_grade?: string;
  submitted_at?: string;
}

// API docs only has:
TeacherEvaluationResponse {
  teacher_id: number;
  evaluator_id: number;
  period_id: number;
  grade: EvaluationGrade;
  // Missing status, total_score, submitted_at, etc.
}
```

### 3. Different Evaluation Model
- **Frontend**: Satu evaluation per teacher per period dengan multiple aspect ratings
- **API Docs**: Satu evaluation per teacher per aspect per period

## Recommendations

1. **Extend Teacher Evaluations API** dengan semua endpoint yang diperlukan frontend
2. **Update data model** untuk mendukung comprehensive evaluation system
3. **Add relationship loading** untuk User, Period, dan EvaluationAspect
4. **Implement status workflow** untuk evaluation lifecycle
5. **Add bulk operations** untuk assign teachers dan mass operations

## Priority

**HIGH**: Endpoints 1, 2, 3, 5, 8 (core functionality)  
**MEDIUM**: Endpoints 4, 6, 7, 10 (advanced features)  
**LOW**: Endpoints 9, 11, 12, 13, 14 (utility functions)