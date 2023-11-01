const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// Register user and sign in
const register = async (req, res) => {
  const { email, password, permissionType } = req.body;

  //check if user exists
  const user = await User.findOne({ email });

  if (user) {
    res.status(422).json({ errors: ["Por favor, utilize outro email"] });
    return;
  }

  const permissionTypeArray = []

  permissionTypeArray.push(permissionType)

  //Generate password hash
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    email,
    password: passwordHash,
    permissionType: permissionTypeArray,
  });

  //If user was created successfuly return the token
  if (!newUser) {
    res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde."] });
  }

  res.status(201).json({
    _id: newUser._id,
    permissionType,
    token: generateToken(newUser._id),
  });
};

//Sign user in
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  //Check if user exists
  if (!user) {
    res.status(404).json({ errors: ["Usuário não encontrado."] });
    return;
  }

  //Check if passwors matches
  if (!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({ errors: ["Senha inválida."] });
    return;
  }

  //Return user with token
  res.status(201).json({
    _id: user._id,
    permissionType: user.permissionType,
    token: generateToken(user._id),
  });
};

//Get current logged in user
const getCurrentUser = async (req, res) => {
  const user = req.user;
  res.status(200).json(user);
};

module.exports = {
  register,
  login,
  getCurrentUser,
};