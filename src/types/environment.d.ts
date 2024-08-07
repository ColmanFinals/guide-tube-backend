export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            ACCESS_TOKEN_SECRET: string;
            REFRESH_TOKEN_SECRET: string;
            JWT_TOKEN_EXPIRATION: string;
            MONGO_URI: string;
        }
    }
}
