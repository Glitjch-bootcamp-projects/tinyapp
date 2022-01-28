const { assert } = require('chai');
const bcrypt = require('bcryptjs');
const generateHelpers = require('../helpers.js');
const { verifyUserByEmailorPassword, generateUid }  = generateHelpers(bcrypt);

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

describe('verifyEmailorPassword', function() {
  it('should return a user with valid email', function() {
    const user = verifyUserByEmailorPassword("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
});