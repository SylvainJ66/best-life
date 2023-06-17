import {createMessagingFixture, MessagingFixture} from "./messaging.fixtures";
import {messageBuilder} from "./message.builder";
import {createFollowingFixture, FollowingFixture} from "./following.fixture";
import {StubDateProvider} from "../infra/stub-date-provider";
import {ViewWallUseCase} from "../application/usecases/view-wall.usecase";
import {MessageRepository} from "../application/message.repository";
import {FolloweeRepository} from "../application/followee.repository";
import {DefaultTimelinePresenter} from "../apps/defaultTimelinePresenter";
import {TimelinePresenter} from "../apps/timeline.presenter";

describe("Feature: Viewing user wall", () => {
    let fixture: Fixture;
    let messagingFixture: MessagingFixture;
    let followingFixture: FollowingFixture;
    beforeEach(() => {
        messagingFixture = createMessagingFixture();
        followingFixture = createFollowingFixture();
        fixture = createFixture({
           messageRepository: messagingFixture.messageRepository,
           followeeRepository: followingFixture.followeeRepository
        });
    });
    describe("Rule: All the message from the user and his followees " +
        "should appear in reverse chronological order", () => {
        test("Charlie has subscribes to Alice's timeline" +
            "and thus can view an aggregate list of all subscriptions", async () => {
            fixture.givenNowIs(new Date("2023-02-09T15:15:30.00Z"));
            messagingFixture.givenTheFollowingMessagesExist([
                messageBuilder()
                    .authoredBy("Alice")
                    .withId("m1")
                    .withText("I love the weather today")
                    .publishedAt(new Date("2023-02-09T15:00:30.000Z"))
                    .build(),
                messageBuilder()
                    .authoredBy("Bob")
                    .withId("m2")
                    .withText("Damn! We lost!")
                    .publishedAt(new Date("2023-02-09T15:01:00.000Z"))
                    .build(),
                messageBuilder()
                    .authoredBy("Charlie")
                    .withId("m3")
                    .withText("I'm in New York today! Anyone wants to have " +
                        "a coffee?")
                    .publishedAt(new Date("2023-02-09T15:15:00.000Z"))
                    .build(),
            ]);
            followingFixture.givenUserFollowees({
                user: "Charlie",
                followees: ["Alice"]
            });
            await fixture.whenUserSeesTheWallOf("Charlie");
            fixture.thenUserShouldSee([
            {
                author: "Charlie",
                text: "I'm in New York today! Anyone wants to have a coffee?",
                publicationTime: "less than 1 minute ago",
            },
            {
                author: "Alice",
                text: "I love the weather today",
                publicationTime: "15 minutes ago",
            }])
        })
    })
})

const createFixture = ({ messageRepository, followeeRepository }: {
    messageRepository: MessageRepository;
    followeeRepository: FolloweeRepository}) => {
    let wall: { author: string; text: string; publicationTime: string }[];
    const dateProvider = new StubDateProvider();
    const defaultWallPresenter = new DefaultTimelinePresenter(dateProvider);
    const wallPresenter: TimelinePresenter = {
        show(theTimeLine ){
            wall = defaultWallPresenter.show(theTimeLine)
        }
    };
    const viewWallUseCase = new ViewWallUseCase(
        messageRepository,
        followeeRepository);
    return {
        givenNowIs(now: Date){
            dateProvider.now = now;
        },
        async whenUserSeesTheWallOf(user: string){
            await viewWallUseCase.handle({ user }, wallPresenter);
        },
        thenUserShouldSee(expectedWall: {
            author: string;
            text: string;
            publicationTime:string }[]){
            expect(wall).toEqual(expectedWall);
        },
    }
}
type Fixture = ReturnType<typeof createFixture>;