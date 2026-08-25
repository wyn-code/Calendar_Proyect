import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface UserSettings {
  id: number;
  user_id: number;
  background_url: string | null;
  primary_color: string | null;
}

export interface UserSettingsUpdate {
  background_url?: string | null;
  primary_color?: string | null;
}

export interface CloudinaryConfig {
  cloud_name: string;
  upload_preset: string;
}

export function useSettings() {
  return useQuery<UserSettings>({
    queryKey: ["settings"],
    queryFn: () => api.get<UserSettings>("/config/settings"),
    retry: false,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserSettingsUpdate) => api.put<UserSettings>("/config/settings", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export function useCloudinaryConfig() {
  return useQuery<CloudinaryConfig>({
    queryKey: ["cloudinary-config"],
    queryFn: () => api.get<CloudinaryConfig>("/config/cloudinary-config"),
    staleTime: Infinity,
  });
}
