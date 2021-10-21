# FHIR Matches

FHIR Matches (name subject to change) reports compatibility between profiles.

# Installation for Developers

FHIR Matches is a [TypeScript](https://www.typescriptlang.org/) project. At a minimum, Matches requires [Node.js](https://nodejs.org/) to build, test, and run the CLI. Developers should install Node.js 14 (LTS).

Once Node.js is installed, run the following command from this project's root folder:

```sh
$ npm install
```

# NPM tasks

The following NPM tasks are useful in development:

| Task              | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **build**         | compiles `src/**/*.ts` files to `dist/**/*.js` files using the TypeScript compiler (tsc)        |
| **build:watch**   | similar to _build_ but automatically builds when changes are detected in src files              |
| **test**          | runs all unit tests using Jest                                                                  |
| **test:watch**    | similar to _test_, but automatically runs affected tests when changes are detected in src files |
| **lint**          | checks all src files to ensure they follow project code styles and rules                        |
| **lint:fix**      | fixes lint errors when automatic fixes are available for them                                   |
| **prettier**      | checks all src files to ensure they follow project formatting conventions                       |
| **prettier:fix**  | fixes prettier errors by rewriting files using project formatting conventions                   |
| **check**         | runs all the checks performed as part of ci (test, lint, prettier)                              |

To run any of these tasks, use `npm run`. For example:

```sh
$ npm run check
```

# Recommended Development Environment

For the best experience, developers should use [Visual Studio Code](https://code.visualstudio.com/) with the following plugins:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - Consider configuring the formatOnSave feature in VS Code settings:
    ```json
    "[typescript]": {
        "editor.formatOnSave": true
    }
    ```

# License

Copyright 2021 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
