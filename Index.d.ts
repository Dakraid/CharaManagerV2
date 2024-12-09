import type {NodePgDatabase} from "drizzle-orm/node-postgres";

declare module 'h3' {
    interface H3EventContext {
        $db?: NodePgDatabase
    }
}

declare module '#auth-utils' {
    interface User {
        username?: string
        password?: string
    }

    interface UserSession {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extended?: any
        loggedInAt: number
        secure?: Record<string, unknown>
    }
}

export {}
