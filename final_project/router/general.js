const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();




public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Stringify book data with indentation for readability
  const formattedBooks = JSON.stringify(books, null, 2); // Pretty-print with 2-space indentation
  return res.status(200).send(formattedBooks);
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Check if book exists in the books object
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorQuery = req.params.author;
  const matchedBooks = [];

  Object.keys(books).forEach(isbn => {
    const book = books[isbn];
    if (book.author.toLowerCase() === authorQuery.toLowerCase()) {
      matchedBooks.push({ isbn, ...book });
    }
  });

  if (matchedBooks.length > 0) {
    const formattedResponse = JSON.stringify(matchedBooks, null, 2); // Pretty-print
    return res.status(200).send(formattedResponse);
  } else {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleQuery = req.params.title;
  const matchedBooks = [];

  // Iterate through each book to find exact title match
  Object.keys(books).forEach(isbn => {
    const book = books[isbn];
    if (book.title.toLowerCase() === titleQuery.toLowerCase()) {
      matchedBooks.push({ isbn, ...book });
    }
  });

  if (matchedBooks.length > 0) {
    const formattedResponse = JSON.stringify(matchedBooks, null, 2); // Prettified JSON string
    return res.status(200).send(formattedResponse);
  } else {
    return res.status(404).json({ message: "No books found with the given title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Check if the ISBN exists in books
  if (books[isbn]) {
    const formattedReviews = JSON.stringify(books[isbn].reviews, null, 2);
    return res.status(200).send(formattedReviews);
  } else {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }
});

module.exports.general = public_users;