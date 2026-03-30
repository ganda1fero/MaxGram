import type { UUID } from "./UUID"

export type GradientPair = {
    topHsl: string,
    bottomHsl: string,
};

export type User = {
    isLoad: boolean,
    readonly ID: UUID, // UUID
    username: string,
    avatarUrl?: string,
    status: 'online' | 'offline',
    lastSeen?: number, // timestamp
    gradientPair: GradientPair,
};