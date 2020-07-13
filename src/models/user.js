const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	fullname : {
		type : String,
		required : true
	},
	email : {
		type : String
		/* unique : true */
	},
	religion : {
		type : String
	},
	gender : {
		type : String
	},
	password : String,
	created_post: [
	    {
	    	type: mongoose.Schema.Types.ObjectId,
	    	ref: "Post"
	    }
	],
	no_of_post: {
		type: Number,
		default: 0
	}
	// is_admin : {
	// 	type: Boolean,
	// 	default: false
	// }

});

module.exports = mongoose.model("User", UserSchema);