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
		
		const verifyPassword = function (user, password, database) {
			const compare = bcrypt.compareSync(password, database[user].password);
			if (!compare) {
				return false;
			}
			return true;
		};

    return { generateUid, getUserByEmail, verifyPassword };
}
module.exports = generateHelpers;
