require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const { name } = require("ejs");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
const port = process.env.PORT || 3000;
//Current Date
const currentDate = new Date();
const createdDate = currentDate.toLocaleDateString("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

mongoose.connect(process.env.MONGODB_CONNECT, { useNewUrlParser: true });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 36000000, // Set the session expiration time (1 hour in milliseconds)
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
const Item = new mongoose.model("Item", itemSchema);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: String,
  username: {
    type: String,
    required: true,
  },
  created: String,
  facebookId: String,
  googleId: String,
  taskFolders: [
    {
      title: String,
      created: String,
      tasks: [itemSchema],
    },
  ],
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Users = new mongoose.model("user", userSchema);
passport.use(Users.createStrategy());
//Create Session
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});
passport.deserializeUser(function (serializedUser, cb) {
  Users.findById(serializedUser.id)
    .exec()
    .then((user) => {
      return cb(null, user);
    })
    .catch((err) => {
      return cb(err, null);
    });
});

//Facebook Oauth
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "emails", "name"],
    },
    function (accessToken, refreshToken, profile, cb) {
      Users.findOrCreate(
        { facebookId: profile.id },
        {
          username: profile.name.familyName + " " + profile.name.givenName,
          email: profile.emails[0].value,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

//Google Oauth

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, cb) {
      Users.findOrCreate(
        { googleId: profile.id },
        { username: profile.displayName, email: profile.emails[0].value }, // Access the first email
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

//Google Oauth Authentication
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/todolist",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/dashboard");
  }
);

//Facebook Authentication
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/dashboard");
  }
);

//Routes
app.get("/sign-up", (req, res) => {
  res.render("sign-up");
});

app.get("/about", function (req, res) {
  res.render("about");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/dashboard", (req, res) => {
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  if (req.isAuthenticated()) {
    const userId = req.user.username;
    const capitalizedUsername = capitalizeFirstLetter(userId);
    const taskFolders = req.user.taskFolders; // Get the taskFolders array

    res.render("dashboard", {
      userId: capitalizedUsername,
      taskFolders: taskFolders,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/sign-up", (req, res) => {
  const { password, email } = req.body;
  const username = req.body.username.toLowerCase();

  Users.register(
    { username: username, created: createdDate, email: email },
    password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.render("sign-up", { warning: "Fill all fields ! " });
      } else {
        res.redirect("/login");
      }
    }
  );
});

app.post("/login", (req, res) => {
  const { password } = req.body;
  const username = req.body.username.toLowerCase();

  const user = new Users({
    username: username,
    password: password,
  });

  if (
    !username ||
    !password ||
    username.trim() === "" ||
    password.trim() === ""
  ) {
    return res.render("login", {
      warning: "Username and password are required!",
    });
  } else {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error(err);
        return res.redirect("/login");
      }
      if (!user) {
        // Authentication failed, set a specific warning message
        return res.render("login", {
          warning: "Incorrect username or password. Please try again.",
        });
      }
      req.login(user, (err) => {
        if (err) {
          console.error(err);
          return res.redirect("/login");
        }
        return res.redirect("/dashboard");
      });
    })(req, res);
  }
});

app.get("/reset-password", (req, res) => {
  res.render("reset-password");
});

app.post("/create-task", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("User is authenticated");
    const userId = req.user._id.toString(); // Convert _id to a string
    const { taskTitle } = req.body;

    if (!taskTitle || taskTitle.trim() === "") {
      // Check if the taskTitle is empty or contains only whitespace
      return res.redirect("/dashboard"); // Redirect without creating the task
    }

    const newTaskFolder = {
      title: taskTitle,
      created: createdDate, // Use the current date
    };

    Users.findByIdAndUpdate(userId, {
      $push: {
        taskFolders: newTaskFolder,
      },
    })
      .then((result) => {
        res.redirect("/dashboard");
      })
      .catch((err) => {
        console.error("Error creating task:", err);
        res.status(500).send("Error creating task");
      });
  } else {
    console.log("User is not authenticated");
    res.redirect("/login");
  }
});

app.get("/tasks/:taskId", (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id.toString();
    const taskId = req.params.taskId;

    Users.findById(userId)
      .then((user) => {
        const selectedFolder = user.taskFolders.find(
          (task) => task._id == taskId
        );
        if (selectedFolder) {
          res.render("task", { selectedFolder: selectedFolder });
        } else {
          res.status(404).send("Task folder not found");
        }
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        res.status(500).send("Error fetching user");
      });
  } else {
    console.log("User is not authenticated");
    res.redirect("/login");
  }
});
app.post("/delete-task/:taskId", (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id.toString();
    const taskId = req.params.taskId;

    Users.findByIdAndUpdate(
      userId,
      { $pull: { taskFolders: { _id: taskId } } },
      { new: true }
    )
      .then(() => {
        res.redirect("/dashboard");
      })
      .catch((err) => {
        console.error("Error deleting task folder:", err);
        res.status(500).send("Error deleting task folder");
      });
  } else {
    console.log("User is not authenticated");
    res.redirect("/login");
  }
});

app.post("/tasks/:folderId/create-task", (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id.toString();
    const folderId = req.params.folderId;
    const newTask = req.body.newTask;

    Users.findById(userId)
      .then((user) => {
        const selectedFolder = user.taskFolders.find(
          (folder) => folder._id.toString() === folderId
        );
        if (selectedFolder) {
          selectedFolder.tasks.push({ name: newTask });
          return user.save();
        } else {
          res.status(404).send("Task folder not found");
        }
      })
      .then(() => {
        res.redirect(`/tasks/${folderId}`);
      })
      .catch((err) => {
        console.error("Error creating task:", err);
        res.status(500).send("Error creating task");
      });
  } else {
    console.log("User is not authenticated");
    res.redirect("/login");
  }
});

app.post("/tasks/:folderId/delete-task/:taskId", (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id.toString();
    const folderId = req.params.folderId;
    const taskId = req.params.taskId;

    Users.findById(userId)
      .then((user) => {
        const selectedFolder = user.taskFolders.find(
          (folder) => folder._id.toString() === folderId
        );
        if (selectedFolder) {
          const taskIndex = selectedFolder.tasks.findIndex(
            (task) => task._id.toString() === taskId
          );

          if (taskIndex !== -1) {
            selectedFolder.tasks.splice(taskIndex, 1);
            return user.save();
          } else {
            res.status(404).send("Task not found");
          }
        } else {
          res.status(404).send("Task folder not found");
        }
      })
      .then(() => {
        res.redirect(`/tasks/${folderId}`);
      })
      .catch((err) => {
        console.error("Error deleting task:", err);
        res.status(500).send("Error deleting task");
      });
  } else {
    console.log("User is not authenticated");
    res.redirect("/login");
  }
});
//End user session
app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("500");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
