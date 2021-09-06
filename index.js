const http = require("http");
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");
const DB =
  "mongodb+srv://rajesh:rass@cluster0.qqfiy.mongodb.net/techbitNode?retryWrites=true&w=majority";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connected"))
  .catch((err) => console.log(err));

// schema
const EmployeeSchema = new mongoose.Schema({
  FirstName: { type: String },
  LastName: { type: String },
  Email: { type: String,
    // unique: [true, "Email is already present"],
  },
  Phone: { type : Number},
  Dept:{ type: String},
  City: { type: String },
});

// Model
const Employee = new mongoose.model("Employee", EmployeeSchema);

//* REST API
const server = http.createServer(async (req, res) => {
   // getAll
  if (req.url === "/" && req.method == "GET") {
    try {
      const userData = await Employee.find();
      res.writeHead(200, { "Content-type": "application/json" });
      res.end(JSON.stringify(userData));
    } catch (error) {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end("failed");
      console.log(error);
    }
  } else if (req.url.match(/\/singleEmp\/([0-9]+)/) && req.method == "GET") {
    // Single Emp
    try {
      const _id = req.url.split("/")[2];
      const singleUser = await Employee.findById(_id);
      if (singleUser) {
        res.writeHead(200, { "Content-type": "application/json" });
        res.end(JSON.stringify(singleUser));
      } else {
        res.writeHead(404, { "Content-type": "application/json" });
        res.end(JSON.stringify({ message: "not found" }));
      }
    } catch (error) {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end("failed");
      console.log(error);
    }
  } else if (req.url === "/postEmp" && req.method === "POST") {
    // Post Emp
    res.writeHead(200, { "Content-type": "application/json" });
    let postData = "";
    req.on("data", (chunk) => {
      postData += chunk.toString();
    });
    req.on("end", async () => {
      postData = JSON.parse(postData);
      try {
        const user = new Employee(postData);
        await user.save();
        res.end("sent successfully");
      } catch (err) {
       res.writeHead(500, { "Content-type": "application/json" });
        res.end({msg:"failed"})
       console.log(err);
      }
    });
  } else if (req.url.match(/\/updateEmp\/([0-9]+)/) && req.method == "PATCH") {
    // Update Emp
    const _id = req.url.split("/")[2];
    res.writeHead(200, { "Content-type": "application/json" });
    let updateData = "";
    req.on("data", (chunk) => {
      updateData += chunk.toString();
    });
    req.on("end", async () => {
      updateData = JSON.parse(updateData);
      try {
        await Employee.findByIdAndUpdate(_id, updateData,{new: true});
        res.end("Update successfully");
      } catch (err) {
      res.writeHead(400, { "Content-type": "application/json" });
      res.end("failed to update");
        console.log(err);
      }
    });
  } else if (req.url.match(/\/deleteEmp\/([0-9]+)/) && req.method === "DELETE") {
    // Delete Emp
    try {
      const _id = req.url.split("/")[2];
      const deletedEmp = await Employee.findByIdAndDelete(_id);
      if (!_id) {
        res.writeHead(404, { "Content-type": "application/json" });
        res.end("not found");
      } else {
        res.writeHead(200, { "Content-type": "application/json" });
        res.end(JSON.stringify(deletedEmp));
      }
    } catch (error) {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end("failed to delete");
      console.log(Error);
    }
  }
else{
  res.writeHead(404, { "Content-type": "application/json" });
  res.end({message:"Page not Found"})
}

});

server.listen(PORT, () => console.log(`Server running on Port  ${PORT}`));
