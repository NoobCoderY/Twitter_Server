import { prismaClient } from "../client/db";
import { redisClient } from "../client/redis";

export interface CreateTweetPayload {
  content: string;
  imageURL?: string;
  userId: string;
}

class TweetService {
  public static async createTweet(data: CreateTweetPayload) {
    const rateLimitFlag = await redisClient.get(
      `RATE_LIMIT:TWEET:${data.userId}`
    );
    if (rateLimitFlag) throw new Error("Please wait....");

    const tweet = await prismaClient.tweet.create({
      data: {
        content: data.content,
        imageURL: data.imageURL,
        author: { connect: { id: data.userId } },
      },
    });
    await redisClient.setex(`RATE_LIMIT:TWEET:${data.userId}`, 10, 1);
    await redisClient.del("ALL_TWEETS");
    return tweet;
  }

  public static async getAllTweets() {
    const cachedTweets = await redisClient.get("ALL_TWEETS");
    if (cachedTweets) return JSON.parse(cachedTweets);

    const tweets = await prismaClient.tweet.findMany({
      orderBy: { createdAt: "desc" },
    });
    await redisClient.set("ALL_TWEETS", JSON.stringify(tweets));
    return tweets;
  }

  public static async deleteTweet(id: string, userId: string | undefined) {
   
    const tweet = await prismaClient.tweet.findUnique({ where: { id } });
    
    if (tweet === null) {
      throw new Error("tweet does not exist");
    }
    else if ( tweet.authorId!==userId) {
      throw new Error("You can not delete this tweet");
    }
    else {
      await prismaClient.tweet.delete({ where: { id: id } })
      await redisClient.del("ALL_TWEETS");
      return "successfully deleted"
    }
  }
}

export default TweetService;
