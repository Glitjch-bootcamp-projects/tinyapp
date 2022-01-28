const generateHelpers = (bcrypt) => {

    const generateUid = function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(12).substring(1);
      };

    const verifyUserByEmailorPassword = function (email, password, database, login) {
        for (const id in database) {
            if (database[id].email === email) {
                if (login) {
                    const compare = bcrypt.compareSync(password, database[id].password);
                    if (compare) {
                        return database[id];
                    }
                    return false;
                }
                return true;
            }
        }
        return false;
    };
    return { verifyUserByEmailorPassword, generateUid };
}
module.exports = generateHelpers;
