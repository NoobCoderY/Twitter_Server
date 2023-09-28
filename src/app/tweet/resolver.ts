import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../inerface";
import { CreateTweetPayload } from "../../services/tweet";
import TweetService from "../../services/tweet";
import UserService from "../../services/user";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";



const queries = {
  getAllTweets: () => TweetService.getAllTweets(),
  getSignedURLForTweet: async (
    parent: any,
    { imageType, imageName }: { imageType: string; imageName: string },
    ctx: GraphqlContext
  ) => {
    console.log(imageType,);
    if (!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
    const allowedImageTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedImageTypes.includes(imageType))
      throw new Error("Unsupported Image Type");

    const s3Client = new S3Client({
      region:process.env.AWS_DEFAULT_REGION
    })

    const putObjectCommand = new PutObjectCommand({
      Bucket: "yash-twitter-dev",
      ContentType: imageType,
      Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}`,
    });

    const signedURL = await getSignedUrl(s3Client, putObjectCommand);
  
    return signedURL;
  },
}
const mutations = {
    createTweet: async (
      parent: any,
      { payload }: { payload: CreateTweetPayload },
      ctx: GraphqlContext
  ) => {
   
    
    if (!ctx.user) throw new Error("You are not authenticated");
      const tweet = await TweetService.createTweet({
        ...payload,
        userId: ctx.user.id,
      });
  
      return tweet;
  },
  deleteTweet: async ( parent: any,
    { id }: { id: string },
    ctx: GraphqlContext) => {
    const message = await TweetService.deleteTweet(id, ctx.user?.id)
    return message;
  }
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) => UserService.getUserById(parent.authorId),
  },
};
  
export const resolvers = { mutations ,extraResolvers,queries};
  