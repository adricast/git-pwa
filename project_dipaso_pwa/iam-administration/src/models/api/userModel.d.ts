export interface User {
    userId?: string;
    tempId?: string;
    username: string;
    identification: string;
    email: string;
    isactive: boolean;
    groupId?: string;
    users?: User[];
}
