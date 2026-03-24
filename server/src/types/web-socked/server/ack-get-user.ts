import type { User } from "../../user.js";

export type AckGetUser = Omit<User, 'createdAt'> & {
    type: 'ACK_GET_USER',
};