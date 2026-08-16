/**
 * 임시 타입 - Task 007에서 실제 DB 스키마 타입(generate_typescript_types 생성물)으로 교체 예정
 */

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
}
