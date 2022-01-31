const generateHelpers = (bcrypt) => {

  // generates random string for multipurpose. Helps create IDs for databases or enhance password encryption
	const generateUid = function () {
		return Math.floor((1 + Math.random()) * 0x10000).toString(12).substring(1);
	};

  // verifies during user registration if inputed email already exists 
	const getUserByEmail = function (email, database) {
		for (const user in database) {
			if (database[user].email === email) {
				return user;
			}
		}
		return false;
	};

  // verifies if encrypted password matches the stored password in users database
	const verifyPassword = function (userId, password, database) {
		const compare = bcrypt.compareSync(password, database[userId].password);
		if (!compare) {
			return false;
		}
		return true;
	};

	return { generateUid, getUserByEmail, verifyPassword };
};

module.exports = generateHelpers;
