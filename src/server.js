const express = require("express");
const bcrypt = require("bcryptjs");


require("./config/db");

const User = require("./models/user");

const app = express ();

/* You need to set app.use(express.json());  so that your express
   file can  read data in Json Format
*/
app.use(express.json());
const port = 1111;


app.post("/register", async (req, res, next) => {
	try {
		// checking if user email exist and preventing multiple users to have the same email 
		const findUser = await User.findOne({ email : req.body.email });
		// console.log(findUser);
		if (findUser) {
			return res.json({ msg : "user with email already exist!"});
		}

		// 8 - 15
		const hashPassword = await bcrypt.hash(req.body.password, 12);

		const newUser = new User({
			fullname : req.body.fullname,
			email : req.body.email,
			religion : req.body.religion,
			gender : req.body.gender,
			password : hashPassword
		});

		// console.log(newUser);

		// saving our data on mongodb
		const savedUser = await newUser.save()

		res.json({ 
			msg : "User created successfully!",
			user : savedUser
		});
		}   catch (err) {
			res.json({ msg : err});
	}
});

app.get("/allUsers", async (req, res, next) => {
	try {
		const allUsers = await User.find();
		 // console.log(allUsers)

		 if (allUsers.length === 0) {
		 	return ({ msg : "Users not found!" });
		 }
		 res.json({ users : allUsers });
	} catch (err) {
		res.json({ msg : err });
	}
});
// req.body
// req.query
// re.params

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

app.get("/singleUser/:id", async (req, res, next) => {
	try {
		const singleUser = await User.findById(req.params.id);

		if (!singleUser) {
			return res.json({ msg : "User not Found!"});
		}

		res.json({ user : singleUser});
	} catch (err) {
		res.json({ msg : err});
	}
});

app.put("/editUser/:id", async (req, res, next) => {
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
		const removeUser = await User.findByIdAndRemove( req.params.id );

		res.json({
			msg : "User Successfully rRemoved",
			user : updatedUser
		});
	} catch (err) {
		res.json({msg : err});
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
