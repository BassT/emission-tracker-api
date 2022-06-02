The repository of the emission tracker API. Built with [Node.js](https://github.com/nodejs), [MongoDB](https://github.com/mongodb), [Express](https://github.com/expressjs) and common libraries of the Express ecosystem.

# Getting started

1: Install dependencies

`npm install`

2: Create a `.env` file which contains the follwing variables `MONGO_URL` and `DB_NAME`

3: Run the app (with naive authentication)

`npm start -- --unsafe-naive-auth`

4: Visit `localhost:3000/docs` to try the API

# Development

The following libraries are used for development:

- [mongoose](https://github.com/Automattic/mongoose) as ODM for MongoDB
- [ajv](https://github.com/ajv-validator) for JSON validation
- [prettier](https://github.com/prettier/prettier) for code formatting
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) for code linting
- [jest-expo](https://github.com/expo/expo/tree/main/packages/jest-expo) for testing

## Authentication

User authentication is implemented using [Azure AD B2C](https://docs.microsoft.com/en-us/azure/active-directory-b2c/) identity management service and [Passport.js](https://github.com/jaredhanson/passport).

# Depolyment

The API is deployed using [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/). The MongoDB cluster is hosted using [MongoDB Atlas](https://www.mongodb.com/atlas).
