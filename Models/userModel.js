const { getDB } = require("../Dbconnection/Dbconn");

const getUsersCollection = () => {
  return getDB().collection("users");
};

const findUserByUsername = (username) => {
  return getUsersCollection().findOne({ username });
};

const findUserById = (id) => {
  const { ObjectId } = require("mongodb");
  return getUsersCollection().findOne({ _id: new ObjectId(id) });
};

const createUser = (userData) => {
  return getUsersCollection().insertOne(userData);
};

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
};
