import type { MockUser } from "@/lib/types/mock";

const NOW = new Date("2026-08-16T09:00:00.000Z").toISOString();

/**
 * 목업 단계에서 "로그인한 사용자"로 취급하는 고정 ID.
 * 실제 인증 연동은 Task 008에서 진행되며, 그 전까지 모든 페이지가 이 사용자를 기준으로 렌더링된다.
 */
export const MOCK_CURRENT_USER_ID = "user-1";

export function getMockCurrentUser(): MockUser {
  return getMockUsers().find((user) => user.id === MOCK_CURRENT_USER_ID)!;
}

export function getMockUsers(): MockUser[] {
  return [
    {
      id: "user-1",
      email: "haeun@example.com",
      name: "김하은",
      avatarUrl: null,
      role: "user",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "user-2",
      email: "minjun@example.com",
      name: "이민준",
      avatarUrl: null,
      role: "user",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "user-3",
      email: "sujin@example.com",
      name: "박수진",
      avatarUrl: null,
      role: "user",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "user-4",
      email: "doyoon@example.com",
      name: "최도윤",
      avatarUrl: null,
      role: "user",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "user-5",
      email: "yerin@example.com",
      name: "정예린",
      avatarUrl: null,
      role: "user",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "admin-1",
      email: "admin@gather.app",
      name: "관리자",
      avatarUrl: null,
      role: "admin",
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];
}
