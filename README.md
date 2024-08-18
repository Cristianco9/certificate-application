# IENSC Fingerprint students authentication API

The Fingerprint Auth API is designed to authenticate students using their fingerprints, which are converted to hashes and stored in a database. This API serves three different client applications:

1. Student Authentication
2. Student Management
3. Student Reports

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- Authenticate students via fingerprint hash
- Manage student records
- Generate student reports

## Technologies Used

- **JavaScript**
- **Node.js**
- **Express.js**
- **JWT**
- **Docker**
- **Mysql**
- **phpMyAdmin**
- **ORM sequelie**


## Getting Started

To get a local copy of this project up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [docker](https://www.docker.com/)

#### Visual Studio Extensions
- [editorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

### Installation

1. Clone the repository:

   ```sh
    git clone https://github.com/Cristianco9/fingerprint-auth-api.git

2. Navigate to the project directory:

   ```sh
    cd fingerprint-auth-api

3. Create the database container and RDBMS:
    ```bash
    docker compose up -d
    ```

4. Insert the Environment Variables in the project:
    ```bash
    npm run env-var
    ```

5. Install the development dependencies necessary to run the project:

   ```sh
    npm run dev-dep

6. Run the database migrations to create tables, relations, and data seeds:
    ```bash
    npm run migrations:run
    ```

7. To start the development server and run the project, use the following command:

   ```sh
    npm run dev

### Usage

Insert the use case

## Contributing

Contributions are what make the open-source community such an amazing place to
learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Contact
LinkedIn - [cristianco9](https://www.linkedin.com/in/cristianco9/)

Project Link: [Github]
(https://github.com/Cristianco9/fingerprint-auth-api.git)

---

Feel free to modify this template according to your preferences and add any
additional information that you think might be useful for users and contributors.
