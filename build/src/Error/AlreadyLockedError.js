var AlreadyLockedError = (function () {
    function AlreadyLockedError(message) {
        this.message = message;
        this.name = 'AlreadyLockedError';
    }
    return AlreadyLockedError;
})();
module.exports = AlreadyLockedError;
