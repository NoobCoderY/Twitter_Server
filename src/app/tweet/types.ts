export const types = `#graphql

     type Likes {
            id: String!
            tweet: Tweet
            user: User
        }

    input CreateTweetData {
        content: String!
        imageURL: String
    }

    type Tweet {
        id: ID!
        content: String!
        imageURL: String
        author: User
        Likes: [Likes]
    }
`;
