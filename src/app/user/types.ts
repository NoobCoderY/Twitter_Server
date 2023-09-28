export const types = `#graphql
    type Likes {
        id: String!
        tweet: Tweet
        user: User
    }
    type User {
        id: ID!
        firstName: String!
        lastName: String
        email: String!
        profileImageURL: String
        followers: [User]
        following: [User]
        recommendedUsers: [User]
        tweets: [Tweet]
        Likes: [Likes]
    }

`;