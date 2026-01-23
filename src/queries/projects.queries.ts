import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectsApi } from "../api/modules/projects.api";

export const projectKeys = {
  all: ["projects"] as const,
  list: (params: Record<string, any>) => [...projectKeys.all, "list", params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export function useProjectsList(params: Record<string, any>) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => ProjectsApi.list(params),
    staleTime: 30_000,
  });
}

export function useProjectDetail(projectId?: string) {
  return useQuery({
    queryKey: projectId ? projectKeys.detail(projectId) : projectKeys.all,
    queryFn: () => {
      if (!projectId) throw new Error("projectId is required");
      return ProjectsApi.get(projectId);
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

// create/update는 mutation + invalidate로 list/detail 갱신
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ProjectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => ProjectsApi.update(projectId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}