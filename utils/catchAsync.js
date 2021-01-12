// This Code is a method for try and catch.

module.exports = ourFunc => {
    return (req, res, next) => {
        ourFunc(req, res, next).catch(next);
    }

}