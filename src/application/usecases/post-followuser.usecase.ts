import {FolloweesRepository} from "../followees.repository";

export class PostFollowUserUseCase{
    constructor(
        private readonly followeesRepository: FolloweesRepository
    ) {}

    async handle(followUserCommand: FollowUserCommand){
        await this.followeesRepository.save(
            followUserCommand.user,
            followUserCommand.userToFollow
        );
    }
}

export type FollowUserCommand = { user: string; userToFollow: string };