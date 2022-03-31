const express = require("express");
const multer = require("multer");
const { exit } = require("process");
const PostController = require("../controllers/posts");
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");
const router = express.Router();
const path = require("path");

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }
        cb(error, path.join(__dirname, "images"));
    },
    filename: (req, file, cb) => {
        const name = file.originalname
            .toLowerCase()
            .split(" ")
            .join("-");
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + "-" + Date.now() + "." + ext);
    }
});

// router.post("",
//   multer({ storage: storage }).single("image"), (req, res, next) => {
//     const url = req.protocol + "://" + req.get("host");
//     // const post = req.body;
//     const post = new Post({
//       email: req.body.email,
//       password: req.body.password,
//       imagePath: url + "/images/" + req.body.image
//     });
//     post.save().then(createdPost => {
//       res.status(201).json({
//         message: "Post added successfully",
//         postId: createdPost._id,
//         email: createdPost.email,
//         password: createdPost.password,
//       });
//     });
//   });

router.post("", checkAuth, multer({ storage: storage }).single("image"), PostController.createPost);

router.get('', PostController.getPosts);

router.get("/:id", PostController.getPost);
router.delete("/:id", checkAuth, PostController.deletePost);
router.put("/:id", checkAuth, multer({ storage: storage }).single("imagePath"), PostController.updatePost);
module.exports = router;