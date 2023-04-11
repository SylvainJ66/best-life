import {InMemoryFolloweesRepository} from "../infra/followeees.inmemory.repository";
import {PostFollowUserUseCase} from "../application/usecases/post-followuser.usecase";
describe("Feature: Following a user", () => {
    let fixture: Fixture;
    beforeEach(() => {


        fixture = createFixture();
    });
    test("Alice can follow Bob", async () => {
        fixture.givenUserFollowees({
            user: "Alice",
            followees: ["Charlie"],
        });
        await fixture.whenUserFollows({
            user: "Bob",
            userToFollow: "Bob"
        });
        await fixture.thenUserFolloweesAre({
            user: "Alice",
            followees: ["Charlie", "Bob"]
        });
    });
});

const createFixture = () => {
    const followeesRepository = new InMemoryFolloweesRepository();
    const postFollowUserUseCase = new PostFollowUserUseCase(followeesRepository);
    return {
        givenUserFollowees({user, followees}: { user: string; followees: string[] }){
            followeesRepository.givenExistingFollowees(user, followees);
        },
        async whenUserFollows(userFollowsCommand: { user: string; userToFollow: string }){
            await postFollowUserUseCase.handle(userFollowsCommand);
        },
        async thenUserFolloweesAre(expectedUserFollowees: { user: string; followees: string[] }){
            const userFollowees = await followeesRepository.getByUser(expectedUserFollowees.user);
            expect(userFollowees).toEqual(expectedUserFollowees);
        },
    }
}

type Fixture = ReturnType<typeof createFixture>