var AlreadyRunningError = (function () {
    function AlreadyRunningError(message) {
        this.message = message;
        this.name = 'AlreadyRunningError';
    }
    return AlreadyRunningError;
})();
module.exports = AlreadyRunningError;
