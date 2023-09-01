export type firestoreUser = {
    id: string;
    email?: string;
    last_connected: Date;
    last_login?: Date;
    
    //Custom attributes
    TrackedUserEvents?: any[];
}

export type UserDevice = {
    platform?: string;
    uuid: string;
    agent: string;
    version: string;
    native_version?: string;
}