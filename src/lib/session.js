import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { getSessionOptions } from './sessionOptions';

export async function getSession() {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, getSessionOptions());
    return session;
}
