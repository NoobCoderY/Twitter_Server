import axios from "axios";
import { prismaClient } from "../../client/db";
import UserService from "../../services/user";
import { GraphqlContext } from "../../inerface";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const resultToken = await UserService.verifyGoogleAuthToken(token);
    return resultToken;
  },
  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;
    const user = await UserService.getUserById(id);
    return user;
  },
};

export const resolvers = { queries };
