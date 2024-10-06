import ballerina/log;
import ballerina/sql;
import ballerinax/kafka;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

// Database configuration
string dbUser = "RXD";
string dbPassword = "100101";
string dbName = "Memobase";

type QueRequest record {
    string author;
    string questionText;
    string courseCode;
    string section;
};

kafka:Consumer queConsumer = check new (kafka:DEFAULT_URL, {
    groupId: "queGroup",
    topics: "quereq" // Subscribe to the quereq topic
});

public function main() returns error? {
    // Start consuming requests
    string|error quereqConsumerResult = check quereqConsumer();
    log:printInfo(check quereqConsumerResult);
}

// Function to process questions requests
function quereqConsumer() returns string|error {
    while true {
        // Poll for new messages from the quereq topic
        QueRequest[] requests = check queConsumer->pollPayload(15); // Poll with a timeout of 15 seconds

        if (requests.length() > 0) {
            log:printInfo("Received " + requests.length().toString() + " request(s) from the quereq topic.");
        }

        from QueRequest request in requests
        do {
            // Log the received request
            log:printInfo("Received request: question =" + request.questionText + ", author =" + request.author);

            // Send question to the database to add it
            string sendQuestionDBResult = check sendQuestionDB(request);
            log:printInfo("Database result for question submission: " + sendQuestionDBResult);
        };

        // Optional: Add a delay to avoid hammering Kafka
        // runtime:sleep(5000); // Sleep for 5 seconds before the next poll
    }
}

type Question record {
    int testNumber;
    string author;
    string questionText;
    string courseCode;
    string section;
};

function sendQuestionDB(QueRequest request) returns string|error {
    log:printInfo("sendQuestionDB: Received request to send question to the database.");

    // Get the current test number
    int testNumber = check getCurrentTestNumber();
    log:printInfo("sendQuestionDB: Retrieved test number: " + testNumber.toString());

    // Create a new question record
    Question newQuestion = {
        testNumber: testNumber,
        author: request.author,
        questionText: request.questionText,
        courseCode: request.courseCode,
        section: request.section
    };

    // Log the new question being inserted
    log:printInfo("sendQuestionDB: Creating new question: " + newQuestion.toString());

    // Insert the question into the database
    string insertResult = check insertQuestionToDB(newQuestion);
    log:printInfo("sendQuestionDB: " + insertResult);

    return insertResult; // Return the result of the insertion
}

// Function to get the current test number
function getCurrentTestNumber() returns int|error {
    mysql:Client mysqlClient = check new ("localhost", dbUser, dbPassword, database = dbName);

    // Create a parameterized query to count how many questions are in the table
    sql:ParameterizedQuery query = `SELECT COUNT(*) AS count FROM question`;

    // Execute the query and get the result
    stream<record {}, sql:Error?> resultStream = mysqlClient->query(query);

    // Initialize a variable to store the count
    int questionCount = 0;
    error? err = resultStream.forEach(function(record {} result) {
        // Log the entire result row to see what's being returned
        log:printInfo("Raw data from DB: " + result.toJsonString());
        questionCount = <int>result["count"];
    });

    // Close the result stream and client connection
    check resultStream.close();
    check mysqlClient.close();

    if err is sql:Error {
        return error("Error retrieving current test number: " + err.message());
    }

    // Log the total count of questions
    log:printInfo("Total questions count: " + questionCount.toString());

    // Calculate the new test number based on count
    return questionCount >= 8 ? (questionCount / 8) + 1 : 1; // Increment the test number
}

// Function to insert a question into the database
function insertQuestionToDB(Question question) returns string|error {
    log:printInfo("insertQuestionToDB: Connecting to the database to insert question.");
    mysql:Client mysqlClient = check new ("localhost", dbUser, dbPassword, database = dbName);

    // Create an insert query
    sql:ParameterizedQuery insertQuery = `INSERT INTO question (test_number, author, question_text, course_code, section) 
                                           VALUES (${question.testNumber}, ${question.author}, ${question.questionText}, ${question.courseCode}, ${question.section})`;

    // Log the insert query for debugging
    log:printInfo("insertQuestionToDB: Executing insert query: " );

    // Execute the insert query
    sql:ExecutionResult executionResult = check mysqlClient->execute(insertQuery);

    // Close the database connection
    check mysqlClient.close();

    log:printInfo("insertQuestionToDB: Successfully inserted question into the database." + executionResult.toString());
    return "Question successfully submitted with Test Number: " + question.testNumber.toString();
}
