const { assert } = require('chai');
const bcrypt = require('bcryptjs');
const generateHelpers = require('../helpers.js');
const { getUserByEmail, generateUid }  = generateHelpers(bcrypt);

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return false with an invalied email (not found in our users database)', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedUserID = false;
    assert.equal(user, expectedUserID);
  });
});

// could not get testing bcrypt to work here to test verifyPassword.