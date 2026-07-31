const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);       // Create (signup)
router.put('/:id', userController.updateUser);      // Update
router.get('/', userController.getUsers);           // List
router.post('/login', userController.loginUser);    // Login

module.exports = router;
