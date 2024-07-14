
export interface IPost {
    _id: string;
    UserId: string;
    ImageUrl: string[];
    originalname: string[];
    description: string;
    isDelete: boolean;
    likes: { userId: string; createdAt: Date }[];
    comments: { userId: string; content: string; created_at: Date }[];
    created_at: Date;
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
}
