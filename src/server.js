const express = require("express");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();			

// DB CONNECTION
require("./config/db");

// DB COLLECTIONS
const User = require("./models/user");
const Post = require("./models/Post");

// AUTH MIDDLEWARE
const auth = require("./config/middleware");

const app = express();// You need to set app.use(express.json());  so that your express   file can  read data in Json Format
app.use(express.json());
const port = process.env.PORT;


app.post("/register", async (req, res, next) => {
	try {
		// checking if user email exist and preventing multiple users to have the same email 
		const findUser = await User.findOne({ email : req.body.email });

		// console.log(findUser);
		if (findUser) {
			return res.json({ msg : "user with email already exist!"});
		}

		// 8 - 15
		const hashedPassword = await bcrypt.hash(req.body.password, 12);

		const newUser = new User({
			fullname : req.body.fullname,
			email : req.body.email,
			religion : req.body.religion,
			gender : req.body.gender,
			password : hashedPassword
		});

		console.log(newUser);

		// saving our data on mongodb
		const savedUser = await newUser.save();

		console.log(savedUser);
		console.log(savedUser._id);

		const token = await jwt.sign({ userId : savedUser._id }, "mysuperdupersecret");

		res.json({ 
			msg : "User created successfully!",
			userToken: token,
			user : savedUser
		});
		}   catch (err) {
			res.json({ msg : err});
	}
});

app.post("/login", async (req, res, next) => {
	try {
		const userEmail = await User.findOne({ email: req.body.email });

		if (!userEmail) {
			return res.json({ msg: "Incorrect Login Details"})
		}
		console.log(userEmail)
		console.log(userEmail.password)

		const passwordMatch = await bcrypt.compare( req.body.password, userEmail.password );

		if (!passwordMatch) {
			return res.json({ msg: "Incorrect login details" });
		}
		const token = await jwt.sign( {userId: userEmail._id}, "mysuperdupersecret" );


		console.log(passwordMatch);

		res.json({
			msg: token,
			user: userEmail
		});
	} catch (err) {
		// res.json({ msg: err });
		throw err
	}
});

app.get("/allUsers", async (req, res, next) => {
	try {
		const allUsers = await User.find();
		  console.log(allUsers)

		 if (allUsers.length === 0) {
		 	return res.json({ msg : "no Users found!" });
		 }
		 res.json({ users : allUsers });
	} catch (err) {
		res.json({ msg : err });
	}
});
// req.body
// req.query
// req.params

app.get("/getuserbyemail", async (req, res, next) => {
	try {
		const userEmail = await User.findOne({ email : req.body.email});

		if (!userEmail) {
			return res.json({ msg : "User not found"});
		}

		res.json({ user : userEmail});
	} catch (err) {
		res.json({ msg : err});
	}
});

app.get("/singleUser", auth, async (req, res, next) => {
	try {
		// req.user coming from auth function (this is what we are returning)

		// const singleUser = await User.findById(req.params.id);
		const aUser = req.user._id; // or this: {_id } = req.user;

		const UserFind = await User.findById(aUser);


		// if (!singleUser) {
		// 	return res.json({ msg : "User not Found!"});
		// }

		res.json({ user : UserFind });
	} catch (err) {
		res.json({ msg : err});
		// throw err;
	}
});

app.put("/editUser/:id", auth, async (req, res, next) => {
	try {
		const singleUser = await User.findById(req.params.id);

		if (!singleUser) {
			return res.json({ msg : "User not Found!"});
		}
		const updatedUser = await User.findByIdAndUpdate( req.params.id, req.body, {new : true});

		res.json({
			msg : "user Successfully Updated",
			user : updatedUser
		});
	} catch (err) {
		res.json({ msg : err});
		// throw err;
	}
});


app.delete("/removeUser/:id", async (req, res, next) => {
	try {
		const singleUser = await User.findById(req.params.id);

		if (!singleUser) {
			return res.json({ msg : "User not Found!"});
		}
		const removedUser = await User.findByIdAndRemove( req.params.id );

		res.json({
			msg : "User Successfully Removed",
		});
	} catch (err) {
		res.json({msg : err});
	}
});

// Post Endpoints
app.post("/createpost", auth, async (req, res, next) =>{
	try {
		const newPost = new Post({
			title: req.body.title,
			content: req.body.content,
			category: req.body.category,
			created_by: req.user._id
		});

		const savedPost = await newPost.save();

		// console.log(savedPost);

		const updatedPost = await User.findByIdAndUpdate(
			req.user._id,
			{ $inc: { no_of_post: +1}, $push: { created_post: savedPost._id } },
			{ new: true}
		);

		res.json({
			msg: "Post created successfully!",
			post: savedPost
		});
	} catch (err) {
		res.json({ msg: err});
	}
});

// Update a SIngle Post(protected Route.  HINT: req.params) Endpoint
app.put("/updatepost/:postId", auth, async (req, res , next) => {
	try {
		const findPost = await Post.findById(req.params.postId);

		console.log(findPost);

		if (!findPost) {
			res.json({ msg: "Post not found!"});
		}

		const updatedPost = await Post.findByIdAndUpdate(
			req.params.postId,
			req.body,
			{ new: true }
		);
		res.json({ 
			msg: "Post Updated Successfully",
			post: updatedPost
		});


	} catch (err) {
		res.json({ msg: err });
	}
});

// User to view post he/she created (Protected Route) HINT: req,params
app.get("/viewpersonalposts", auth, async (req, res, next) => {
	try{
		const personalPosts = await Post.find({ created_by: req.user._id });

		if (personalPosts.length === 0) {
			return res.json({ msg: "you have not created any post!"});
		}

		res.json({ post: personalPosts });
		
	} catch (err) {
		res.json({ msg: err });
	}
});

// View all Posts (Public Route)
app.get("/viewallposts", async (req, res, next) => {
	try{
		const allPosts = await Post.find();
		
		// console.log(allPosts);


		if (allPosts.length === 0) {
			return res.json({ msg: "No post found!"});
		}

		res.json({ post: allPosts });
		
	} catch (err) {
		res.json({ msg: err });
	}
});

// View Posts by Category (Protected Route)
app.get("/postsbycategory", async (req, res, next) => {
	try {
		const postCategory = await Post.find({ category: req.body.category });
		  console.log(postCategory)

		 if (postCategory.length === 0) {
		 	return res.json({ msg : "No post by category found!" });
		 }
		 res.json({ users : postCategory });
	} catch (err) {
		res.json({ msg : err });
	}
});

// view single post (Protected Route) HINT: req.params
app.get("/singlePost/:postId", auth, async (req, res, next) => {
	try {
		const findPost = await Post.findById(req.params.postId);

		// const aPost = req.post._id; // or this: {_id } = req.post;
		// const postFind = await User.findById(aPost);
		console.log(findPost);


		if (!findPost) {
			return res.json({ msg : "User not Found!"});
		}

		res.json({ post : findPost });
	} catch (err) {
		res.json({ msg : err});
		// throw err;
	}
});


// Delete a single post (Protected Route) HINT:req.params
app.delete("/removePost/:postId", auth, async (req, res, next) => {
	try {
		const findPost = await Post.findById(req.params.postId);
		// console.log(findPost);
		if (!findPost) {
			return res.json({ msg : "Post not Found!"});
		}

		const removedPost = await Post.findByIdAndRemove( req.params.postId );


		const updatedPost = await User.findByIdAndUpdate(
			req.user._id,
			{ $inc: { no_of_post: -1 }, $pull: { created_post: removePost._id } },
			{ new: true }
		);
		console.log(updatedPost);

		res.json({
			msg : "Post Successfully Removed",
		});
	} catch (err) {
		throw err
		// res.json({msg : err});
	}
});

// app.post("/register", (req, res, next) => {
// 	let user = [];

// 	// push data enter by user in req bodyinto the empty array...

// 	user.push({
// 		fullname : req.body.fullname,
// 		email : req.body.email,
// 		age : req.body.age,
// 	});

// 	// Response data
// 	res.json({
// 		msg : "Your Account is Successfully Created",
// 		user : user,
// 	});
// });

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(port, () => {
	console.log(`Server is listening on ${port}`)
});
