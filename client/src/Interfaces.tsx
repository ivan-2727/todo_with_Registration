export interface itemInterface {
    title: string,
    description: string,
    id: number,
    done: boolean
}

export interface listInterface {
    frozen? : boolean;
    owner?: string,
    name?: string,
    items : itemInterface[]
} 

export interface appStateInterface {
    allLists : {[listId: string]: listInterface}
}

export interface loginStateInterface {
    userAlreadyExists : boolean;
    wrongLogin : boolean;
    successfulRegistration: boolean;
    error : string;
}