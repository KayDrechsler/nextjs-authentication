import db from "./db";
import { cookies } from "next/headers";
import { Lucia } from "lucia";

export function createUser(email, password) {
    const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(
        email,
        password
    );

    return result.lastInsertRowid;
};

export function userByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}