import express from "express";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { User } from "./user";
import cors from "cors"
import JWTService from "../services/jwt";
import { GraphqlContext } from "../inerface";


export async function initServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors())

  app.get("/", (req, res) =>
    res.status(200).json({ message: "Everything is good" })
  );

  const graphqlServer = new ApolloServer<GraphqlContext>({
      typeDefs: `${User.types}
      type Query
      {
       ${User.queries}
      }
    `,

      resolvers: {
          Query: {
              ...User.resolvers.queries
        }
    },
  });

  await graphqlServer.start();

  app.use("/graphql", expressMiddleware(graphqlServer, {
    context: async ({ req, res }) => {
      return {
        user: req.headers.authorization
          ? JWTService.decodeToken(
              req.headers.authorization.split("Bearer ")[1]
            )
          : undefined,
      };
    },
  }))

  return app;
}
