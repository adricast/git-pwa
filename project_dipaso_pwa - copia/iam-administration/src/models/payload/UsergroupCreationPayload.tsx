export interface UserGroupCreatePayload {
  userGroupId: string;
  groupName: string;
  description?: string;
  integrationCode?: string;
  criticality?: string;   // "LOW" | "MEDIUM" | "HIGH"
  isActive?: boolean;
  createdByUserId: string;
}
