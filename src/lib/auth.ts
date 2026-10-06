import { repo, User, Workspace, Membership } from "../db/repo";
import { cookies } from "next/headers";

export interface SessionContext {
  user: User;
  workspace: Workspace;
  membership: Membership;
  allWorkspaces: Workspace[];
}

export async function getSessionContext(): Promise<SessionContext> {
  // Read workspace cookie or fallback to first workspace
  const cookieStore = await cookies();
  const currentWorkspaceId = cookieStore.get("adscope_active_workspace")?.value || "ws_acme_growth";

  let workspace = repo.getWorkspace(currentWorkspaceId);
  if (!workspace) {
    const all = repo.getWorkspaces();
    workspace = all[0] || repo.createWorkspace({ name: "Default Workspace", slug: "default" });
  }

  // Get demo or current user
  let user = repo.getUser("alex@acmegrowth.io");
  if (!user) {
    user = repo.createUser({
      email: "alex@acmegrowth.io",
      name: "Alex Rivera",
      role: "user",
    });
  }

  // Resolve membership
  let memberships = repo.getMemberships(workspace.id);
  let userMembership = memberships.find((m) => m.userId === user.id);
  if (!userMembership) {
    userMembership = repo.createMembership(workspace.id, user.id, "owner");
  }

  return {
    user,
    workspace,
    membership: userMembership,
    allWorkspaces: repo.getWorkspaces(),
  };
}

export function assertRole(membership: Membership, requiredRole: "owner" | "admin" | "member"): boolean {
  const roleWeights = { member: 1, admin: 2, owner: 3 };
  return roleWeights[membership.role] >= roleWeights[requiredRole];
}
