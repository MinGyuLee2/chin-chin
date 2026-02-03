export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          kakao_id: number;
          nickname: string | null;
          profile_image_url: string | null;
          kakao_access_token: string | null;
          kakao_refresh_token: string | null;
          created_at: string;
          last_login_at: string;
        };
        Insert: {
          id?: string;
          kakao_id: number;
          nickname?: string | null;
          profile_image_url?: string | null;
          kakao_access_token?: string | null;
          kakao_refresh_token?: string | null;
          created_at?: string;
          last_login_at?: string;
        };
        Update: {
          id?: string;
          kakao_id?: number;
          nickname?: string | null;
          profile_image_url?: string | null;
          kakao_access_token?: string | null;
          kakao_refresh_token?: string | null;
          created_at?: string;
          last_login_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          short_id: string;
          creator_id: string;
          target_id: string | null;
          photo_url: string;
          original_photo_url: string | null;
          name: string | null;
          age: number;
          gender: "male" | "female";
          occupation_category: string | null;
          bio: string;
          interest_tags: string[];
          mbti: string | null;
          music_genre: string | null;
          instagram_id: string | null;
          kakao_open_chat_id: string | null;
          expires_at: string;
          is_active: boolean;
          view_count: number;
          chat_request_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          short_id: string;
          creator_id: string;
          target_id?: string | null;
          photo_url: string;
          original_photo_url?: string | null;
          name?: string | null;
          age: number;
          gender: "male" | "female";
          occupation_category?: string | null;
          bio: string;
          interest_tags: string[];
          mbti?: string | null;
          music_genre?: string | null;
          instagram_id?: string | null;
          kakao_open_chat_id?: string | null;
          expires_at: string;
          is_active?: boolean;
          view_count?: number;
          chat_request_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          short_id?: string;
          creator_id?: string;
          target_id?: string | null;
          photo_url?: string;
          original_photo_url?: string | null;
          name?: string | null;
          age?: number;
          gender?: "male" | "female";
          occupation_category?: string | null;
          bio?: string;
          interest_tags?: string[];
          mbti?: string | null;
          music_genre?: string | null;
          instagram_id?: string | null;
          kakao_open_chat_id?: string | null;
          expires_at?: string;
          is_active?: boolean;
          view_count?: number;
          chat_request_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          profile_id: string;
          requester_id: string;
          target_id: string;
          status: "pending" | "active" | "rejected" | "expired" | "completed";
          profile_revealed: boolean;
          profile_revealed_at: string | null;
          reveal_requested_by: string | null;
          last_message_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          requester_id: string;
          target_id: string;
          status?: "pending" | "active" | "rejected" | "expired" | "completed";
          profile_revealed?: boolean;
          profile_revealed_at?: string | null;
          reveal_requested_by?: string | null;
          last_message_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          requester_id?: string;
          target_id?: string;
          status?: "pending" | "active" | "rejected" | "expired" | "completed";
          profile_revealed?: boolean;
          profile_revealed_at?: string | null;
          reveal_requested_by?: string | null;
          last_message_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          sender_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string | null;
          message: string | null;
          link_url: string | null;
          sent_via: string;
          sent_at: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title?: string | null;
          message?: string | null;
          link_url?: string | null;
          sent_via?: string;
          sent_at?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string | null;
          message?: string | null;
          link_url?: string | null;
          sent_via?: string;
          sent_at?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          room_id: string | null;
          reason: string;
          description: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          room_id?: string | null;
          reason: string;
          description?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_id?: string;
          room_id?: string | null;
          reason?: string;
          description?: string | null;
          status?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience types
export type User = Tables<"users">;
export type Profile = Tables<"profiles">;
export type ChatRoom = Tables<"chat_rooms">;
export type Message = Tables<"messages">;
export type Notification = Tables<"notifications">;
export type Report = Tables<"reports">;
