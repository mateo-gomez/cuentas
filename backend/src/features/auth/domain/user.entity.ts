export interface User {
    _id: string;
    email: string;
    password: string;
    name: string;
    surename: string;
    lastname: string;
    createdAt: Date;
    updatedAt: Date;
}

// Sanitized shape returned by GET/PATCH /auth/me — never exposes the password hash.
export type PublicUser = Omit<User, "password">;