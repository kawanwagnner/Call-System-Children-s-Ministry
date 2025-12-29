# React Query Implementation

## ✅ O que foi implementado

Refatorei todo o projeto para usar **React Query (TanStack Query)** para gerenciamento de estado e cache de dados do servidor.

### 📁 Hooks criados

#### 1. **useStudentQueries.ts**

- `useStudentsWithStatus()` - Lista alunos com status
- `useStudents()` - Lista alunos simples
- `useStudent()` - Obtém um aluno específico
- `useCreateStudent()` - Cria um novo aluno
- `useUpdateStudent()` - Atualiza um aluno
- `useDeleteStudent()` - Deleta um aluno

#### 2. **useLessonQueries.ts**

- `useLessons()` - Lista aulas/eventos
- `useLesson()` - Obtém uma aula específica
- `useCreateLesson()` - Cria uma nova aula
- `useUpdateLesson()` - Atualiza uma aula
- `useDeleteLesson()` - Deleta uma aula

#### 3. **useAttendanceQueries.ts**

- `useAttendance()` - Obtém attendance de uma aula
- `useSaveAttendance()` - Salva attendance de múltiplos alunos

#### 4. **useGroupQueries.ts**

- `useGroups()` - Lista grupos

#### 5. **useDashboardQueries.ts**

- `useDashboardStats()` - Estatísticas do dashboard

#### 6. **useReportQueries.ts**

- `useReportsData()` - Dados completos de relatórios

### 📄 Páginas refatoradas

Todas as páginas foram refatoradas para usar React Query:

1. ✅ **StudentsPage** - Gerenciamento de alunos
2. ✅ **LessonsPage** - Gerenciamento de aulas
3. ✅ **AttendancePage** - Chamada/presença
4. ✅ **HomePage** - Dashboard com estatísticas
5. ✅ **ReportsPage** - Relatórios e analytics

### 🎯 Benefícios

#### 1. **Cache Automático**

- Dados são cacheados por 5 minutos
- Reduz chamadas desnecessárias ao servidor
- Melhora performance

#### 2. **Loading e Error States**

- Estados de carregamento padronizados
- Tratamento de erros consistente
- Melhor UX

#### 3. **Invalidação Inteligente**

- Quando cria/atualiza/deleta um item, o cache é invalidado automaticamente
- Dados sempre sincronizados

#### 4. **Refetch Automático**

- Refetch quando reconecta à internet
- Refetch opcional ao focar a janela

#### 5. **DevTools**

- React Query DevTools para debug
- Visualize queries, cache e estado

### 🔧 Configuração

#### queryClient.ts

```typescript
{
  queries: {
    staleTime: 1000 * 60 * 5,  // 5 minutos
    gcTime: 1000 * 60 * 10,     // 10 minutos
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  }
}
```

### 🚀 Como usar

#### Exemplo de uso em um componente:

```typescript
function MyComponent() {
  const { data: students, isLoading, error } = useStudents("ministerio");
  const createStudent = useCreateStudent("ministerio");

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  const handleCreate = async () => {
    await createStudent.mutateAsync(newStudentData);
    // Cache será invalidado automaticamente!
  };

  return (
    <div>
      {students.map((student) => (
        <div key={student.id}>{student.full_name}</div>
      ))}
    </div>
  );
}
```

### 🎨 DevTools

Para abrir o React Query DevTools, pressione **Ctrl + Shift + D** (ou clique no ícone flutuante no canto inferior esquerdo).

### 📊 Query Keys Organizadas

Todas as query keys estão padronizadas:

```typescript
studentKeys.list("ministerio"); // ['students', 'list', 'ministerio']
studentKeys.detail("id"); // ['students', 'detail', 'id']
lessonKeys.list("recepcao"); // ['lessons', 'list', 'recepcao']
attendanceKeys.list("id", "context"); // ['attendance', 'list', 'id', 'context']
```

### ⚡ Performance

- **Antes**: Cada vez que navegava para uma página, fazia requests ao servidor
- **Agora**: Dados em cache são reutilizados, apenas refaz request se necessário

### 🔄 Sincronização

Quando você:

- ✅ Cria um aluno → lista de alunos é atualizada automaticamente
- ✅ Deleta uma aula → lista de aulas é atualizada automaticamente
- ✅ Salva attendance → status dos alunos é atualizado automaticamente

### 🎯 Próximos Passos (Opcionais)

1. **Infinite Queries** - Paginação infinita para listas grandes
2. **Optimistic Updates** - Updates imediatos na UI antes da confirmação do servidor
3. **Mutations Queue** - Fila de mutations offline-first
4. **Prefetching** - Pré-carregar dados antes de navegar

---

**Nota**: Todas as funcionalidades existentes continuam funcionando normalmente! A refatoração foi apenas interna para melhorar performance e manutenibilidade.
