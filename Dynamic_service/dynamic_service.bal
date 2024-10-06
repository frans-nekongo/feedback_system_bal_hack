import ballerina/lang.runtime;
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

type Question record {
    int testNumber;
    string author;
    string questionText;
    string courseCode;
    string section;
};
type QuestionRecord record {
    int question_number;
    string question_text;
    string course_code;
    string section;
    string author;
    string? answer; // Optional as it can be null
    string? test_number; // Optional as it can be null
};


type MemodueRequest record {
    string request_type;
};

type memDuereqConsumerRecord record {
    string value; // We are expecting the request value as a string
};

// Kafka Consumers
kafka:Consumer queConsumer = check new (kafka:DEFAULT_URL, {
    groupId: "queGroup",
    topics: "quereq" // Subscribe to the quereq topic
});

kafka:Consumer memDueConsumer = check new (kafka:DEFAULT_URL, {
    groupId: "memreqGroup",
    topics: "memDuereq" // Subscribe to the memDuereq topic
});

kafka:Consumer memConsumer = check new (kafka:DEFAULT_URL, {
    groupId: "memGroup",
    topics: "memreq " // Subscribe to the memDuereq topic
});

// Kafka Producer
kafka:Producer memDuerepProducer = check new (kafka:DEFAULT_URL);

public function main() returns error? {
    // Start both consumers concurrently
    _ = start quereqConsumer();
    _ = start memoduerequest();

    // Keep the application running
    while true {
        runtime:sleep(5000);
    }
}

// Function to process question requests
function quereqConsumer() returns string|error {
    while true {
        log:printInfo("Polling for quereq messages...");

        // Poll for new messages from the quereq topic
        QueRequest[] requests = check queConsumer->pollPayload(15); // Poll with a timeout of 15 seconds

        if (requests.length() > 0) {
            log:printInfo("Received " + requests.length().toString() + " request(s) from the quereq topic.");
        } else {
            log:printInfo("No messages received from quereq topic.");
        }

        from QueRequest request in requests
        do {
            // Log the received request
            log:printInfo("Received request: question = " + request.questionText + ", author = " + request.author);

            // Send question to the database to add it
            string sendQuestionDBResult = check sendQuestionDB(request);
            log:printInfo("Database result for question submission: " + sendQuestionDBResult);
        };
    }
}

// Function to send the question to the database
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
    log:printInfo("insertQuestionToDB: Executing insert query.");

    // Execute the insert query
    sql:ExecutionResult executionResult = check mysqlClient->execute(insertQuery);

    // Close the database connection
    check mysqlClient.close();

    log:printInfo("insertQuestionToDB: Successfully inserted question into the database." + executionResult.toString());
    return "Question successfully submitted with Test Number: " + question.testNumber.toString();
}

function memoduerequest() returns string|error {
    kafka:Consumer memDueConsumer = check new (kafka:DEFAULT_URL, {
        groupId: "memDueGroup", // Define the group for the consumer
        topics: "memDuereq" // Subscribe to the memDuereq topic
    });

    while true {
        log:printInfo("Polling for memDuereq messages..."); // Log the start of polling

        // Poll for new messages from the memDuereq topic
        MemodueRequest[] messages = check memDueConsumer->pollPayload(15); // Poll with a 15-second timeout

        if (messages.length() > 0) {
            log:printInfo("Received " + messages.length().toString() + " request(s) from memDuereq topic.");

            // Process the received messages
            foreach MemodueRequest msg in messages {
                // Log the received message
                log:printInfo("Received raw message: " + msg.toString()); // Log the raw message

                // Extract the request type
                string requestType = msg.request_type; // Directly access the field

                if (requestType == "memos_due_request") {
                    // Query the database for questions with NULL or empty answers
                    QuestionRecord[] questionsWithoutAnswers = check getQuestionsWithoutAnswers();
                    log:printInfo("Retrieved " + questionsWithoutAnswers.length().toString() + " question(s) with no answers.");

                    // Prepare the response message to send to Kafka
                    json[] responseMessage = []; // Initialize responseMessage as an empty array
                    foreach QuestionRecord question in questionsWithoutAnswers {
                        // Collect each question into a response object
                        json questionData = {
                            question_number: question.question_number,
                            test_number: question.test_number,
                            author: question.author,
                            question_text: question.question_text,
                            course_code: question.course_code,
                            section: question.section
                        };

                        // Add question data to the response array using indexing
                        responseMessage[responseMessage.length()] = questionData; // Append questionData to the array
                    }

                    // Log the complete response message before sending
                    log:printInfo("Sending all questions without answers to memDuerep topic: " + responseMessage.toJsonString());

                    // Send the complete response message to the Kafka memDuerep topic
                    check memDuerepProducer->send({
                        topic: "memDuerep",
                        value: responseMessage.toJsonString() // Send as a JSON string
                    });

                    log:printInfo("Successfully sent all unanswered questions to the memDuerep topic.");
                }
            }
        } else {
            log:printInfo("No messages received from memDuereq topic.");
        }
    }
}

// Function to get questions without answers
function getQuestionsWithoutAnswers() returns QuestionRecord[]|error {
    mysql:Client mysqlClient = check new ("localhost", dbUser, dbPassword, database = dbName);

    // Create a query to get questions with NULL or empty answers
    sql:ParameterizedQuery query = `SELECT question_number, author, question_text, course_code, test_number, section 
                                    FROM question 
                                    WHERE answer IS NULL OR answer = '';`;

    // Execute the query and get the result stream
    stream<QuestionRecord, sql:Error?> resultStream = mysqlClient->query(query);

    // Initialize an array to store questions
    QuestionRecord[] questions = [];

    // Process the result stream
    error? err = resultStream.forEach(function(QuestionRecord question) {
        questions.push(question);
    });

    // Close the result stream and client connection
    check resultStream.close();
    check mysqlClient.close();

    // Return the list of questions
    return questions;
}

//function to most memo
function memreqConsumer() returns string|error {
    while true {
        log:printInfo("Polling for memreq messages...");

        // Poll for new messages from the memreq  topic
        QueRequest[] requests = check memConsumer->pollPayload(15); // Poll with a timeout of 15 seconds

    }
}

function postquestion(){
    
}