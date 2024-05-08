# Streamfy

[![CI](https://github.com/enmanuelmag/Streamfy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/enmanuelmag/Streamfy/actions/workflows/ci.yml)

## Requirements

🚨🚨 IMPORTANT 🚨🚨

You need to login with a Discord account to use the app. The reason is to fetch the user's guilds that the user is part of, and then fetch the channels of the guilds to show the user the channels that the user can join to watch the stream.

The unique information used from Discord account is: email, username, avatar and the guilds that the user is part of.

- Install [NodeJs](https://nodejs.org/en) >= v20.
- Add the .env file inside the folder `global/env`, you see the template with the required variables in the file env.template that's in the sabe folder `global/env`.

## Installation

Here are three npm projects, to install all the dependencies run the following command in the only root folder, no more commands are required after this:

```Bash
npm i
```

## Development mode

Then, to start the development server, first is necessary to run build global deps:

```Bash
npm run global:build
```

Then, run the following command:

```Bash
npm run dev
```

## Production mode

To build the project, is necessary to build the whole project:

```Bash
npm run build
```

Then to start the built project:

```Bash
npm run start
```

# What's in the boilerplate

> Boilerplate for React/Typescript/Express/Zustand, built on top of Vite ⚡️

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Zustand](https://zustand-demo.pmnd.rs)
- Dev Tools
  - [ESLint](https://eslint.org/)
  - [Prettier](https://prettier.io/)
  - [CommitLint](https://commitlint.js.org/#/)
  - [Husky](https://typicode.github.io/husky/#/)
  - [Lint-Staged](https://github.com/okonet/lint-staged)


# License

MIT
