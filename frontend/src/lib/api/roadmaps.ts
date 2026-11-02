/**
 * Roadmaps API Service
 *
 * Handles roadmap generation, retrieval, and task updates.
 */
import { apiClient } from "@/lib/api-client";

export interface RoadmapTask {
  id: number;
  title: string;
  description: string;
  phase: string;
  order: number;
  status: "pending" | "in_progress" | "completed" | "blocked";
  estimated_duration: string;
  resources: string[];
  deliverables: string[];
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: number;
  user: number;
  startup_name: string;
  industry: string;
  stage: string;
  tasks: RoadmapTask[];
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface RoadmapPayload {
  startup_name: string;
  industry: string;
  stage: string;
  description: string;
  target_market: string;
  business_model: string;
}

export interface TaskUpdatePayload {
  status: "pending" | "in_progress" | "completed" | "blocked";
}

export const roadmapsApi = {
  /**
   * Create a new roadmap (triggers AI generation).
   * POST /api/v1/roadmap/
   */
  createRoadmap: (data: RoadmapPayload) =>
    apiClient.post<Roadmap>("/api/v1/roadmap/", data),

  /**
   * Get the current roadmap.
   * GET /api/v1/roadmap/
   */
  getRoadmap: () => apiClient.get<Roadmap>("/api/v1/roadmap/"),

  /**
   * Update a task's status.
   * PATCH /api/v1/roadmap/tasks/<task_id>/
   */
  updateTask: (taskId: number, data: TaskUpdatePayload) =>
    apiClient.patch<RoadmapTask>(`/api/v1/roadmap/tasks/${taskId}/`, data),
};