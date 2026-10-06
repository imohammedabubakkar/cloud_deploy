const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8787/api").replace(/\/$/, "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.message || "Unable to complete the database request.");
    return data;
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") throw error;
    throw new Error(`Cannot reach the backend at ${baseUrl}. Start it with "npm run dev" from the backend folder.`);
  }
}

const isUnavailable = (error: unknown) =>
  error instanceof Error && error.message === "DATABASE_SERVICE_UNAVAILABLE";

const readLocal = <T,>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const writeLocal = (key: string, values: unknown[]) =>
  localStorage.setItem(key, JSON.stringify(values));

type TeamIdentity = { username: string; email: string };

const rememberTeamIdentity = (member: { username: string; email: string }) => {
  const identities = readLocal<TeamIdentity>("clouddeployx-team-identities");
  const username = member.username.toLowerCase();
  const email = member.email.toLowerCase();
  if (identities.some(item => item.username === username || item.email === email)) return;
  writeLocal("clouddeployx-team-identities", [
    ...identities,
    { username, email },
  ]);
};

export const accountApi = {
  async list() {
    try {
      return await request<{ users: Array<Record<string, string>> }>("/users");
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      return { users: readLocal<Record<string, string>>("clouddeployx-users") };
    }
  },
  async check(username: string, email: string) {
    try {
      return await request<{ usernameUsed: boolean; emailUsed: boolean }>(
        `/users/check?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`,
      );
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      const accounts = readLocal<{ username: string; email: string }>("clouddeployx-users");
      return {
        usernameUsed: Boolean(username && accounts.some(account => account.username.toLowerCase() === username.toLowerCase())),
        emailUsed: Boolean(email && accounts.some(account => account.email.toLowerCase() === email.toLowerCase())),
      };
    }
  },
  async signup(account: any) {
    return request<{ user: Record<string, string> }>("/users/signup", {
      method: "POST",
      body: JSON.stringify(account),
    });
  },
  async login(identifier: string, passwordHash: string) {
    try {
      return await request<{ user: { name: string; username: string; email: string } }>("/users/login", {
        method: "POST",
        body: JSON.stringify({ identifier, passwordHash }),
      });
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      const accounts = readLocal<any>("clouddeployx-users");
      const normalized = identifier.toLowerCase();
      const user = accounts.find(item =>
        (item.username.toLowerCase() === normalized || item.email.toLowerCase() === normalized)
        && item.passwordHash === passwordHash
      );
      if (!user) throw new Error("Invalid username or password.");
      return { user };
    }
  },
  async remove(username: string) {
    try {
      return await request<{ success: boolean }>(`/users/${encodeURIComponent(username)}`, {
        method: "DELETE",
      });
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      const accounts = readLocal<any>("clouddeployx-users");
      writeLocal("clouddeployx-users", accounts.filter(item => item.username !== username));
      return { success: true };
    }
  },
};

export const activityApi = {
  async list() {
    try {
      return await request<{ events: Array<Record<string, string>> }>("/activity");
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      return { events: readLocal<Record<string, string>>("clouddeployx-activity") };
    }
  },
  async create(event: Record<string, string>) {
    try {
      return await request<{ event: Record<string, string> }>("/activity", {
        method: "POST",
        body: JSON.stringify(event),
      });
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      const events = readLocal<Record<string, string>>("clouddeployx-activity");
      const savedEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      writeLocal("clouddeployx-activity", [savedEvent, ...events]);
      return { event: savedEvent };
    }
  },
};

export const teamApi = {
  async list() {
    try {
      const result = await request<{ members: Array<Record<string, string>> }>("/team");
      result.members.forEach(member => {
        if (member.username && member.email) rememberTeamIdentity({ username: member.username, email: member.email });
      });
      return result;
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      const members = readLocal<Record<string, string>>("clouddeployx-team");
      members.forEach(member => {
        if (member.username && member.email) rememberTeamIdentity({ username: member.username, email: member.email });
      });
      return { members };
    }
  },
  async invite(member: any) {
    const result = await request<{ member: Record<string, string> }>("/team", {
      method: "POST",
      body: JSON.stringify(member),
    });
    rememberTeamIdentity(member);
    return result;
  },
  async login(identifier: string, passwordHash: string) {
    try {
      return await request<{ member: Record<string, string> }>("/team/login", {
        method: "POST",
        body: JSON.stringify({ identifier, passwordHash }),
      });
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      const members = readLocal<any>("clouddeployx-team");
      const normalized = identifier.toLowerCase();
      const member = members.find(item =>
        (item.username?.toLowerCase() === normalized || item.email.toLowerCase() === normalized)
        && item.passwordHash === passwordHash
      );
      if (!member) throw new Error("Invalid team username or password.");
      const updated = { ...member, status: "Active", lastActive: "Now" };
      writeLocal("clouddeployx-team", members.map(item => item.email === member.email ? updated : item));
      return { member: updated };
    }
  },
  async remove(username: string) {
    try {
      return await request<{ success: boolean }>(`/team/${encodeURIComponent(username)}`, {
        method: "DELETE",
      });
    } catch (error) {
      if (!isUnavailable(error)) throw error;
      const members = readLocal<any>("clouddeployx-team");
      writeLocal("clouddeployx-team", members.filter(item => item.username !== username));
      return { success: true };
    }
  },
};
