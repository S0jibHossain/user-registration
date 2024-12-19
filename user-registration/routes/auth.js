const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();


const JWT_SECRET = process.env.JWT_SECRET;


router.post('/register', async (req, res) => {
  const { firstName, lastName, NIDNumber, phoneNumber, password, bloodGroup } = req.body;


  if (!firstName || !lastName || !NIDNumber || !phoneNumber || !password || !bloodGroup) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
   
    const userExists = await User.findOne({ $or: [{ NIDNumber }, { phoneNumber }] });
    if (userExists) {
      return res.status(400).json({ msg: 'User with this NID or phone number already exists' });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = new User({
      firstName,
      lastName,
      NIDNumber,
      phoneNumber,
      password: hashedPassword,
      bloodGroup,
    });


    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  const { NIDNumber, password } = req.body;

  if (!NIDNumber || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {

    const user = await User.findOne({ NIDNumber });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }


    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });


    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.get('/profile', async (req, res) => {
  const token = req.cookies.token;


  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
});


router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.put('/update/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
    res.json({ msg: 'User updated successfully', updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
