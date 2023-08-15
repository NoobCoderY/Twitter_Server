import axios from "axios";
import { prismaClient } from "../../client/db";
import UserService from "../../services/user";

const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
      const resultToken = await UserService.verifyGoogleAuthToken(token);
    return resultToken;
  },
          
  };
  
  export const resolvers = { queries};