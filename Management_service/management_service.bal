// AUTO-GENERATED FILE.
// This file is auto-generated by the Ballerina OpenAPI tool.

import ballerina/http;
import ballerina/log; // Import the logging module
import ballerinax/kafka;

listener http:Listener ep0 = new (9090, config = {host: "localhost"});

// Request and response record definitions
type memos_body record {
    // Define fields as needed
};

type questions_body record {
    // Define fields as needed
};

type inline_response_200 record {
    string questionNumber;
    string questionText;
    string courseCode;
    string section;
    string author;
    string answer;
    string testNumber;
};

type MemDueResponseMessage record {
    int question_number;
    string test_number;
    string author;
    string question_text;
    string course_code;
    string section;
};

type inline_response_200_1 record {
    string idNumber; // Unique ID of the user.
    string name; // Name of the user.
    string userType; // Type of user: "student" or "lecturer".
};

type AuthRequest record {
    string username;
    string password;
};

type AuthResponse record {
    string idNumber; // Unique ID of the user
    string name; // Name of the user
    string userType; // Type of user: "student" or "lecturer"
    string status; // e.g., "success" or "error"
    string message; // Additional message if needed (optional)
};

type questionRequest record {
    string author;
    string questionText;
    string courseCode;
    string section;
};

//  Create a subtype of `kafka:AnydataConsumerRecord`.
// Define the structure of the message received from Kafka
type AuthResponseMessage record {
    string name;
    string message; // This is a string representation of the inner JSON
};

// Create a subtype of `kafka:AnydataConsumerRecord`
type AuthConsumerRecord record {|
    *kafka:AnydataConsumerRecord;
    AuthResponseMessage value; // Change this to the new type
|};

type memDuerepConsumerRecord record {|
    *kafka:AnydataConsumerRecord;
    json value; // Treat the value as raw JSON
|};

service / on ep0 {

    // kafka initialisation stuff random here..oh well
    private final kafka:Producer authProducer;
    private final kafka:Consumer authConsumer;

    private final kafka:Producer queProducer;
    private final kafka:Consumer queConsumer;

    private final kafka:Producer memProducer;
    private final kafka:Consumer memConsumer;

    private final kafka:Producer memQProducer;
    private final kafka:Consumer memQConsumer;

    function init() returns error? {
        self.authProducer = check new (kafka:DEFAULT_URL);
        self.authConsumer = check new (kafka:DEFAULT_URL, {
            groupId: "authGroup",
            topics: "authrep"
        });

        self.queProducer = check new (kafka:DEFAULT_URL);
        self.queConsumer = check new (kafka:DEFAULT_URL, {
            groupId: "queGroup", //was authGroup
            topics: "querep"
        });

        self.memProducer = check new (kafka:DEFAULT_URL);
        self.memConsumer = check new (kafka:DEFAULT_URL, {
            groupId: "memGroup",
            topics: "memDuerep"
        });

        self.memQProducer = check new (kafka:DEFAULT_URL);
        // self.memConsumer = check new (kafka:DEFAULT_URL, {
        //     groupId: "memGroup",
        //     topics: "memDuerep"
        // });

        // Subscribe to the topic
        check self.authConsumer->subscribe(["authrep"]);
        check self.queConsumer->subscribe(["querep"]);
        check self.memConsumer->subscribe(["memDuerep"]);

    }

    # Check if a user exists
    #
    # + return - returns can be any of following types 
    # inline_response_200_1 (User details if found.)
    # http:NotFound (User not found.)
    # http:Unauthorized (Invalid credentials.)
    resource function get auth(string username, string password) returns string|inline_response_200_1|error {
        AuthRequest request = {username: username, password: password};

        log:printInfo("Sending authentication request: " + request.toString());
        //data go
        // Send the authentication request to the Kafka topic "authreq"
        check self.authProducer->send({
            topic: "authreq",
            value: request
        });
        //data come
        while true {
            // Poll for messages from the authrep topic
            AuthConsumerRecord[] records = check self.authConsumer->poll(15);
            if (records.length() > 0) {
                from AuthConsumerRecord orderRecord in records
                do {
                    log:printInfo("Received record from authrep: " + orderRecord.value.toString());

                    // Deserialize the outer message
                    string name = orderRecord.value.name; // This should be a string
                    string innerMessage = orderRecord.value.message; // Get the inner message string

                    // Deserialize the inner message
                    json userData = check innerMessage.fromJsonString();

                    // Create the authResponse object
                    inline_response_200_1 authResponse = {
                        idNumber: check userData.user_number,
                        name: check userData.name,
                        userType: check userData.user_type
                    };

                    log:printInfo("Authentication successful for user: " + authResponse.toString());
                    return authResponse; // Return the constructed authResponse
                };
            }
        }

        // Return unauthorized error if no valid response was received

    }

    // The following resources can be defined as needed

    // # Retrieve all memos due
    // #
    // # + return - List of tests with memos due and their questions. 
    resource function get memosDue() returns json|error {
        // Log the request for memos
        log:printInfo("Sending memos due request to Kafka topic: memDuereq.");

        // Create a JSON message for the request
        json message = {
            request_type: "memos_due_request",
            details: "Requesting memos due"
        };

        // Send the request to the Kafka topic "memDuereq"
        check self.memProducer->send({
            topic: "memDuereq",
            value: message.toJsonString() // Convert JSON to string before sending
        });

        // Wait for the response from the Kafka topic "memDuerep"
        while true {
            // Poll for messages from the "memDuerep" topic with a 15-second timeout
            memDuerepConsumerRecord[] records = check self.memConsumer->poll(15);

            // If records are received, process them
            if (records.length() > 0) {
                foreach memDuerepConsumerRecord memoRecord in records {
                    // Log the received message from Kafka
                    log:printInfo("Received message from memDuerep: " + memoRecord.value.toString());

                    // Return the JSON value directly
                    return memoRecord.value;
                }
            }
        }
    }

    // # Retrieve all tests and their questions
    // #
    // # + return - List of tests with their questions. 
    resource function get tests() returns json|error {
        // Log the request for test
        log:printInfo("Sending test get request to Kafka topic: memDuereq.");

        // Create a JSON message for the request
        json message = {
            request_type: "memos_due_request",
            details: "Requesting memos due"
        };

        // Send the request to the Kafka topic "memDuereq"
        check self.memProducer->send({
            topic: "memDuereq",
            value: message.toJsonString() // Convert JSON to string before sending
        });

        // Wait for the response from the Kafka topic "memDuerep"
        while true {
            // Poll for messages from the "memDuerep" topic with a 15-second timeout
            memDuerepConsumerRecord[] records = check self.memConsumer->poll(15);

            // If records are received, process them
            if (records.length() > 0) {
                foreach memDuerepConsumerRecord memoRecord in records {
                    // Log the received message from Kafka
                    log:printInfo("Received message from memDuerep: " + memoRecord.value.toString());

                    // Return the JSON value directly
                    return memoRecord.value;
                }
            }
        }
    }

    // # Send a memo
    // #
    // # + payload - The memo details to be sent. 
    // # + return - Memo successfully submitted. 
    resource function post memos(@http:Payload memos_body payload) returns string|error {
        log:printInfo("Received question request: " + payload.toString());

        // Send the question details to the Kafka topic "quereq"
        check self.memQProducer->send({
            topic: "memreq",
            value: payload
        });

        log:printInfo("Memo sent to Kafka topic memreq: " + payload.toString());

        // Return success response
        log:printInfo("Memo successfully submitted to memreq.");

        //add logic here to send succes mssg to client only after you get the response from the querep

        return "Memo successfully submitted.";
    }

    // # Send a question
    // #
    // # + payload - The question details to be sent. 
    // # + return - Question successfully submitted. 
    resource function post questions(@http:Payload questions_body payload) returns string|error {
        log:printInfo("Received question request: " + payload.toString());

        // Send the question details to the Kafka topic "quereq"
        check self.queProducer->send({
            topic: "quereq",
            value: payload
        });

        log:printInfo("Question sent to Kafka topic quereq: " + payload.toString());

        // Return success response
        log:printInfo("Question successfully submitted to quereq.");

        //add logic here to send succes mssg to client only after you get the response from the querep

        return "Question successfully submitted.";

    }
}
