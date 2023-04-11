export interface FolloweesRepository{
    save(user: string, userToFollow: string) :Promise<void>;
}