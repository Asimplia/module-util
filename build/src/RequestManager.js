var RequestManager = (function () {
    function RequestManager() {
    }
    RequestManager.getPostData = function (req, res, callback) {
        if (req.readable) {
            var content = '';

            req.on('data', function (data) {
                if (content.length > 1e6) {
                    res.status(413);
                    res.send({ error: 'Request entity too large.' });
                }

                content += data;
            });

            req.on('end', function () {
                callback(content);
            });
        } else {
            callback(req.body);
        }
    };
    return RequestManager;
})();
module.exports = RequestManager;
