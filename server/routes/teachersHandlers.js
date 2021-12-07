const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const { v4: uuidv4 } = require("uuid");

//.................................................................................//
//TEACHER ROUTES                                                                   //
//.................................................................................//

//GET ALL TEACHERS (FOR BUILDING PURPOSES ONLY)
const getTeachers = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();
  try {
    const db = client.db("ClassLibrary");
    const allTeachers = await db.collection("Teachers").find().toArray();
    if (allTeachers) {
      res
        .status(200)
        .json({ status: 200, data: allTeachers, message: "Teachers found" });
    } else {
      res
        .status(400)
        .json({ status: 400, errorMsg: "no Teachers found in db" });
    }
    client.close();
  } catch (e) {
    console.log(e);
    client.close();
  }
};

//GET TEACHERS BY EMAIL
const getTeacherByEmail = async (req, res) => {
  const { email } = req.params;

  const client = new MongoClient(MONGO_URI, options);
  await client.connect();
  try {
    const db = client.db("ClassLibrary");

    //validate if teacher exists
    const teacherResults = await db.collection("Teachers").findOne({ email });
    console.log(teacherResults);
    //if teacher exists, send message that teacher is found
    if (teacherResults) {
      res.status(201).json({
        status: 201,
        data: teacherResults,
        message: "Teacher found",
      });
    }
    //if the teacher doesn't exist, send message that teacher not found
    else {
      //send response
      res.status(404).json({
        status: 404,
        errorMsg: "teacher not found",
      });
    }

    client.close();
  } catch (e) {
    console.log(e);
    client.close();
  }
};

//POST NEW TEACHER TO COLLECTION
//BODY :{
//email(from Auth0),
//givenName,
//surname,
//libraries(empty array to start),
//classroooms(empty array to start),
//categories(from categories collection)
//}
const postNewTeacher = async (req, res) => {
  //create id and new teach object
  const id = uuidv4();
  const { email } = req.body;
  const newTeacherObject = { _id: id, ...req.body };
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();
  try {
    const db = client.db("ClassLibrary");
    //validate if teacher exists
    const teacherResults = await db.collection("Teachers").findOne({ email });
    console.log(teacherResults);
    //if teacher exists, send message that it already exists
    if (teacherResults) {
      res.status(400).json({
        status: 400,
        teacherResults,
        errorMsg: "Teacher already exists",
      });
    }
    //if the teacher doesn't exist, add the new teacher
    else {
      await db.collection("Teachers").insertOne(newTeacherObject);
      //send response
      res.status(201).json({
        status: 201,
        data: newTeacherObject,
        message: "teacher successfully added",
      });
    }

    //close database
    client.close();
  } catch (e) {
    console.log(e);
    client.close();
  }
};

//ADD NEW LIBRARY (PATCH) (DONE IN LIBRARY ROUTES)
// const addNewLibrary = async (req, res) => {
//   const client = new MongoClient(MONGO_URI, options);
//   await client.connect();
//   try {
//     const db = client.db("ClassLibrary");
//     client.close();
//   } catch (e) {
//     console.log(e);
//     client.close();
//   }
// };

//ADD NEW CLASSROOM (PATCH) (DONE IN CLASSROOM ROUTES)
// const addNewClassroom = async (req, res) => {
//   const client = new MongoClient(MONGO_URI, options);
//   await client.connect();
//   try {
//     const db = client.db("ClassLibrary");
//     client.close();
//   } catch (e) {
//     console.log(e);
//     client.close();
//   }
// };

//!!NEED TO MODIFY TO TAKE INTO ACCOUTN DELETEING LIBRARIES AND CLASSROOM ASSOCIATED WITH TEACHER
//DELETE TEACHER BY EMAIL(DELETE)
const deleteTeacher = async (req, res) => {
  const { email } = req.params;
  console.log(email);
  const client = new MongoClient(MONGO_URI, options);

  await client.connect();
  try {
    const db = client.db("ClassLibrary");
    const deletedTeacher = await db.collection("Teachers").deleteOne({ email });
    console.log(deletedTeacher);
    deletedTeacher.deletedCount > 0
      ? res
          .status(200)
          .json({ status: 200, message: "teacher account deleted" })
      : res.status(404).json({
          status: 404,
          errorMsg: `no teacher found with email: ${email}`,
        });

    client.close();
  } catch (e) {
    console.log(e);
    client.close();
  }
};

module.exports = {
  getTeachers,
  getTeacherByEmail,
  postNewTeacher,
  deleteTeacher,
};
