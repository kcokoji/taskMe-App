# To-Do List Web Application

Welcome to the To-Do List web application repository! This web application is built using Node.js, Express.js, MongoDB, and Passport.js to help you manage your tasks efficiently. Whether you want to create, edit, or delete tasks, this application provides a user-friendly interface to handle your to-do list with ease.

![taskMe Screenshoot](https://github.com/kcokoji/taskMe-App/assets/100976015/171b9f38-7c1d-4975-b2a4-af25a9852d2e)


## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)    
- [User Authentication](#user-authentication)
- [Task Management](#task-management)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Registration and Authentication:**
  - Users can sign up and log in securely using their credentials.
  - OAuth2 authentication options with Google and Facebook are available for quick registration and login.

- **To-Do List Management:**
  - Create, edit, and delete tasks to stay organized.
  - Tasks can be organized into different task folders.

- **Case-Insensitive Authentication:**
  - User authentication is case-insensitive, providing a hassle-free login experience.

- **Dynamic Usernames:**
  - Usernames are dynamically displayed on the dashboard with the first letter capitalized for a polished appearance.

## Getting Started

### Prerequisites

Before you start, ensure you have the following installed on your system:

- Node.js: [Download and Install Node.js](https://nodejs.org/)
- MongoDB: [Download and Install MongoDB](https://www.mongodb.com/try/download/community)

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/kcokoji/taskMe-App.git
   
2. Navigate to the project directory:
   cd your-repository
3. Install the project dependencies:
```bash
npm install 
```
4. Create a .env file in the root directory of the project and configure your environment variables:
```bash
MONGODB_CONNECT=your-mongodb-connection-string
SECRET_KEY=your-secret-key
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/todolist
PORT=3000
```

### Usage
1.To run the application, use the following command:
```bash
npm start
```
The application will be accessible at http://localhost:3000 by default. You can customize the port in the .env file.

### User Authentication
To register a new account, visit the /sign-up page.
To log in, visit the /login page.
OAuth2 authentication with Google and Facebook is available through the respective buttons on the registration and login pages.


### Task Management
After logging in, you will be directed to your personalized dashboard.
You can create, edit, and delete tasks.
Tasks can be organized into different task folders.

### Contributing
Contributions and feedback are welcome! If you would like to contribute to the project, follow these steps:

- Fork the repository.
- Create a new branch for your feature or bug fix: git checkout -b feature-name.
- Make your changes and commit them: git commit -m 'Add new feature'.
- Push your changes to your fork: git push origin feature-name.
- Create a pull request from your fork to the main repository.

### License
This project is open-source and available under the GNU General Public License v3.0. You are free to use, modify, and distribute this code as per the terms of the license.

Enjoy managing your to-do list with our web application! If you have any questions or encounter issues, please feel free to create an issue on this repository.
