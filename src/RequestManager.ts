
import express = require('express');

export = RequestManager;
class RequestManager  {
	static getPostData(req: any/*express.Request*/, res: express.Response, callback: (data: string) => void) {
        // Check if this is a form post or a stream post via REST client.
        if (req.readable) {
            // REST post.
            var content = '';

            req.on('data', function (data: any) {
                if (content.length > 1e6) {
					// Flood attack or faulty client, nuke request.
					res.status(413);
                    res.send({ error: 'Request entity too large.' });
                }

                // Append data.
                content += data;
            });

            req.on('end', function () {
                // Return the posted data.
                callback(content);
            });
        } else {
            // Form post.
            callback(req.body);
        }
    }
}