const express = require("express");
const { ApolloServer,gql} = require("apollo-server-express");
const { GraphQLUpload } = require('apollo-upload-server');
const fs = require('fs');


const app = express();


const typeDefs = gql`
  type Query {
    hello: String!
  }

  type Mutation {
    uploadFile(file: Upload!): String!
    uploadMultipleFiles(files: [Upload!]!): String!
  }
`;

const resolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    uploadFile: async (_, { file }) => {
      const { createReadStream, filename } = await file;
      let date = new Date().getTime();
      let ext = filename.split('.').pop();
      let fileNameCustom = `${date}.${ext}`;
      const stream = createReadStream();
      const path = `uploads/${fileNameCustom}`;

      await new Promise((resolve, reject) =>
        stream
          .on('error', (error) => {
            if (stream.truncated)
              // Delete the truncated file
              fs.unlinkSync(path);
            reject(error);
          })
          .pipe(fs.createWriteStream(path))
          .on('error', (error) => reject(error))
          .on('finish', () => resolve())
      );

      return `File uploaded: ${fileNameCustom}`;
    },
    uploadMultipleFiles: async (_, { files }) => {
      console.log(files);
    },
  },

  Query: {
    hello: () => 'Hello, World!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () => {
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
});
