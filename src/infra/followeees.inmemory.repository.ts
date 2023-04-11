import {FolloweesRepository} from "../application/followees.repository";

export class InMemoryFolloweesRepository implements FolloweesRepository{
    followees = new Map<string, string[]>()
    save(user: string, userToFollow: string): Promise<void>{
        if(this.followees.has(user)){
            this.followees.get(user)?.push(userToFollow)
        }else{
            this.followees.set(user, [userToFollow]);
        }
        return Promise.resolve();
    }
    givenExistingFollowees(user, followees){
        followees.forEach(this.save.bind(this));
    }
    async getByUser(user: string): Promise<string> {
        return Promise.resolve(this.followees.get(user));
    }
}