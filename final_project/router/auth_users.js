const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};


//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Authenticate the user
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // Store token in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "Login successful", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  // Get the logged-in username from session
  const username = req.session?.authorization?.username;

  // Validate input
  if (!username) {
    return res.status(403).json({ message: "You must be logged in to post a review" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content must be provided in the query string" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  // Add or modify review under the logged-in user's name
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review successfully added/updated", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session?.authorization?.username;

  // Check if user is logged in
  if (!username) {
    return res.status(403).json({ message: "You must be logged in to delete a review" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  // Check if user has a review on this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on the specified book" });
  }

  // Delete user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review successfully deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
