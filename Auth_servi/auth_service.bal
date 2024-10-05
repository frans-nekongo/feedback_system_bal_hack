// import ballerina/cache;
// import ballerina/io;
import ballerina/log; // Import the logging module
import ballerina/sql;
import ballerinax/kafka;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

// Database configuration
string dbUrl = "localhost:3306";
string dbUser = "RXD";
string dbPassword = "100101";
string dbName = "Memobase";

configurable string USER = "RXD";
configurable string PASSWORD = "100101";
configurable string HOST = "localhost";
configurable int PORT = 3306;
configurable string DATABASE = "Memobase";

// Request and response record definitions
type AuthRequest record {
    string username;
    string password;
};

type AuthResponse record {
    string name; // Name of the user
    string message; // Additional message if needed (optional)
};

public function main() returns error? {

    // []]]]]]]]]][][]] consumer section ][ ][][] [] [ ] ]] 
    // Create a consumer for the authreq topic
    kafka:Consumer authConsumer = check new (kafka:DEFAULT_URL, {
        groupId: "authGroup", // Define the group for the consumer
        topics: "authreq" // Subscribe to the authreq topic
    });

    while true {
        // Poll for new messages from the authreq topic
        AuthRequest[] requests = check authConsumer->pollPayload(15); // Poll with a timeout of 15 seconds

        if (requests.length() > 0) {
            log:printInfo("Received " + requests.length().toString() + " authentication request(s) from the authreq topic.");
        }

        from AuthRequest request in requests
        do {
            // Log the received request
            log:printInfo("Received authentication request: username=" + request.username + ", password=" + request.password);
            // / []]]]]]]]]][][]] get user from db and send him to authrep section ][ ][][] [] [ ] ]]
            //get user from databse
            User|error? userFromDb = getuserfromdb(request.username, request.password);

            if userFromDb is User {
                log:printInfo("User found: " + userFromDb.toString());
            } else {
                log:printError("Error: " + (check userFromDb).toString());
            }

            // Forward the user as an AuthResponse
            // AuthResponse response = {
            //     idNumber: "", // No ID to forward yet
            //     name: request.username,
            //     userType: "", // No userType to forward yet
            //     status: "pending", // Set status to pending for forwarded requests
            //     message: "Request forwarded, no processing done."
            // };

            // // Send the response to the authrep topic
            // kafka:Producer authProducer = check new (kafka:DEFAULT_URL);
            // check authProducer->send({
            //     topic: "authrep",
            //     value: response
            // });

            // log:printInfo("Forwarded authentication request for user: " + request.username + " to authrep topic.");
        };
    }

}

// Function to process authentication requests

function getuserfromdb(string username, string userpassword) returns User|error? {
    mysql:Client mysqlClient = check new ("localhost", dbUser, dbPassword, database = "Memobase");
    // Create a parameterized query to fetch the user data based on input
    sql:ParameterizedQuery query = `SELECT * FROM user
                                    WHERE user_number = ${username} AND password = ${userpassword}`;

    // Execute the query and get the result stream
    stream<User, sql:Error?> resultStream = mysqlClient->query(query);

    // Initialize the userRow variable with `()`
    User? userRow = ();

    // Iterate through the stream to fetch the user data
    error? err = resultStream.forEach(function(User user) {
        // Assign the first result to userRow and exit the loop
        userRow = user;
        return; // This stops after the first match is found
    });

    // Close the result stream and client connection
    check resultStream.close();
    check mysqlClient.close();

    // Check if userRow is not null (i.e., if a user was found)
    if userRow is User {
        // Log the found user
        log:printInfo("User found: " + userRow.toString());

        // Construct the AuthResponse from the user data
        AuthResponse response = {

            name: username,
            message: userRow.toJsonString()
        };

        // Log the response
        log:printInfo("AuthResponse: " + response.toString());

        // Send the response to the authrep topic
        check sendAuthResponse(response);

        return userRow; // Return the userRow if needed elsewhere
    } else if err is sql:Error {
        return error("SQL Error: " + err.message());
    } else {
        return error("User not found or invalid credentials.");
    }
}

// Function to send the authentication response to the authrep topic
function sendAuthResponse(AuthResponse response) returns error? {
    // Create a producer for the authrep topic
    kafka:Producer authProducer = check new (kafka:DEFAULT_URL);

    // Send the response
    check authProducer->send({
        topic: "authrep",
        value: response
    });

    log:printInfo("Forwarded authentication request for user: " + response.name + " to authrep topic.");
}

// Define the User record type
type User record {
    string user_number;
    string name;
    string user_type;
    string password; // Password should be handled securely
};
