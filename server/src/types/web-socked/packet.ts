import type { UUID } from "node:crypto";

export interface Packet<T = any> {
    msgId: UUID,
    payLoad: T,
}