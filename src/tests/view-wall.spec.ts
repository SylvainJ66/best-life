import {describe} from "node:test";

describe("Feature: Viewing user wall", () => {
    let fixture: Fixture;
    beforeEach(() => {
       fixture = createFixture();
    });
    describe("Rule: All the message from the user and his followees " +
        "should appear in reverse chronological order", () => {
        test("Charlie has subscribes to Alice's timeline" +
            "and thus can view an aggregate list of all subscriptions", () => {
            async () => {
              fixture.thenUserShouldSee([
                  {
                      author: "Charlie",
                      text: "I'm in New York today! Anyone want's to have a coffee ?",
                      publicationTime: "less than a minute ago",
                  },
                  {
                      author: "Alice",
                      text: "I love the weather today",
                      publicationTime: "15 minutes ago",
                  }
              ])
            };
        })
    })
})

const createFixture = () => {
    return {
        thenUserShouldSee(wall: {})
    }
}
type Fixture = ReturnType<typeof createFixture>;