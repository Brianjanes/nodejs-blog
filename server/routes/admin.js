const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

//check login
const authMiddleware = (request, response, next) => {
  const token = request.cookies.token;

  if (!token) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    request.userId = decoded.userId;
    next();
  } catch (error) {
    response.status(401).json({ message: "Unauthorized" });
  }
};
//GET
//admin - login page
router.get("/admin", async (request, response) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    response.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//POST
// admin - check login

router.post("/admin", async (request, response) => {
  try {
    const { username, password } = request.body;

    const user = await User.findOne({ username });

    if (!user) {
      return response.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return response.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    response.cookie("token", token, { httpOnly: true });
    response.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//GET
// admin dashboard
router.get("/dashboard", authMiddleware, async (request, response) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    const data = await Post.find();
    response.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log("Error: " + error);
  }
});

//GET
//admin create new post

router.get("/add-post", authMiddleware, async (request, response) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs and MongoDb.",
    };
    const data = await Post.find();

    response.render("admin/add-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log("Error:", error);
  }
});

//POST
//admin create post to DB

router.post("/add-post", authMiddleware, async (request, response) => {
  try {
    try {
      const newPost = new Post({
        title: request.body.title,
        body: request.body.body,
      });

      await Post.create(newPost);

      response.redirect("/dashboard");
    } catch (error) {
      console.log("Error:", error);
    }
  } catch (error) {
    console.log("Error:", error);
  }
});

//GET
//admin create post to DB

router.get("/edit-post/:id", authMiddleware, async (request, response) => {
  try {
    const locals = {
      title: "Edit post",
      description: "Free NodeJS user management system",
    };
    const data = await Post.findOne({ _id: request.params.id });

    response.render("admin/edit-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log("Error:", error);
  }
});

//PUT
//admin create post to DB
router.put("/edit-post/:id", authMiddleware, async (request, response) => {
  try {
    await Post.findByIdAndUpdate(request.params.id, {
      title: request.body.title,
      body: request.body.body,
      updatedAt: Date.now(),
    });

    response.redirect(`/edit-post/${request.params.id}`);
  } catch (error) {
    console.log("Error:", error);
  }
});

//DELETE
//Admin delete post

router.delete("/delete-post/:id", authMiddleware, async (request, response) => {
  try {
    await Post.deleteOne({ _id: request.params.id });
    response.redirect("/dashboard");
  } catch (error) {
    console.log("Error", error);
  }
});

//GET
//admin logout

router.get("/logout", async (request, response) => {
  response.clearCookie("token");
  // response.json({ message: "logout successful." });
  response.redirect("/");
});

// POST
// for registering admin

// router.post("/register", async (request, response) => {
//   try {
//     const { username, password } = request.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//       const user = await User.create({ username, password: hashedPassword });
//       response.status(201).json({ message: "User Created", user });
//     } catch (error) {
//       if (error.code === 11000) {
//         response.status(409).json({ message: "User already in use" });
//       }
//       response.status(500).json({ message: "Internal server error" });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });
module.exports = router;
