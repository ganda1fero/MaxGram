import type { UUID } from "../UUID"

export interface Packet<T = any> {
    msgId: UUID,
    payLoad: T,
}