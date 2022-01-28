const generateHelpers = (bcrypt) => {

	const generateUid = function () {
		return Math.floor((1 + Math.random()) * 0x10000).toString(12).substring(1);
	};

	const getUserByEmail = function (email, database) {
		for (const user in database) {
			if (database[user].email === email) {
				return user;
			}
		}
		return false;
	};

	const verifyPassword = function (userId, password, database) {
		console.log('log', userId);
		console.log('log', database[userId]);
		const compare = bcrypt.compareSync(password, database[userId].password);
		if (!compare) {
			return false;
		}
		return true;
	};

	return { generateUid, getUserByEmail, verifyPassword };
};

module.exports = generateHelpers;
