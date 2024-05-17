'use server';
import { redirect } from "next/navigation";
import { createUser } from "@/lib/user";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createAuthSession, destroySession } from "@/lib/auth";
import { userByEmail } from "@/lib/user";

export const signUp = async (prevState, formData) => {
    const email = formData.get('email');
    const password = formData.get('password');

    let errors = {};

    if (!email.includes('@')) {
        errors.email = 'Please enter a valid email address';
    }

    if (password.trim().length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
        return {
            errors,
        };
    }

    // Store data in the database (create a new user)
    const hashedPassword = hashUserPassword(password);

    try {
        const id = createUser(email, hashedPassword);
        await createAuthSession(id);
        redirect('/training');
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return {
                errors: {
                    email: 'Email already in use',
                }
            }
        }
        throw error;
    }
};

export async function login(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const existingUser = userByEmail(email);

    if (!existingUser) {
        return {
            errors: {
                email: 'Could not authenticate user, please check your credentials.',
            }
        }
    }

    const isValidPassword = verifyPassword(existingUser.password, password);

    if (!isValidPassword) {
        return {
            errors: {
                password: 'Could not authenticate user, please check your credentials.',
            }
        }
    }

    await createAuthSession(existingUser.id);
    redirect('/training');
};


export async function auth(mode, prevState, formData) {
    if (mode === 'login') {
        return login(prevState, formData);
    }
    return signUp(prevState, formData);
};

export async function logout() {
    await destroySession();
    redirect('/');
};
