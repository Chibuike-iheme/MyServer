const mongoose = require("mongoose");

// To use promises with mongoose
mongoose.Promise = global.Promise;

// mongodb+srv://IceRock:<password>@mycluster-arha3.mongodb.net/<dbname>?retryWrites=true&w=majority

const  DB_URL = "mongodb+srv://IceRock:Mikewill11.com@mycluster-arha3.mongodb.net/class?retryWrites=true&w=majority";

try {
	mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
} catch (err) {
	throw err;
}

mongoose.connection.on("connected", () => {
	console.log(`Connected to database ${DB_URL}`);
});