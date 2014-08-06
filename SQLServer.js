var SQLServer = (function () {
    function SQLServer() {
        this.CONNECTION_STRING_PATTERN = 'Driver={SQL Server Native Client 11.0};Server={#{server},#{port}};Database={#{database}};Uid={#{user}};Pwd={#{password}};Trusted_Connection={#{trusted}};';
    }
    SQLServer.parseConnectionString = function (connectionString) {
        var parts = connectionString.split(';');
        var values = {};
        parts.forEach(function (part) {
            var valuePair = part.split('=');
            values[valuePair[0]] = valuePair[1];
        });
        var server = values['Server'].split(',');
        var config = {
            driver: values['Driver'],
            user: values['Uid'],
            password: values['Pwd'],
            server: server[0],
            port: server[1],
            database: values['Database']
        };
        return config;
    };
    return SQLServer;
})();
module.exports = SQLServer;
