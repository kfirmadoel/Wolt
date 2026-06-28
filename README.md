# Advanced Systems Programming - Recommendation Server (Ex2)

## Project Overview
This project is a Client-Server application implementing a product recommendation system. 
The system operates over a TCP connection where the client sends commands (POST, GET, PATCH, DELETE, help) and the server processes them, updates the persistent storage, and returns the appropriate status codes and data.

The server is implemented in **C++** using Test-Driven Development (TDD) and adheres to SOLID principles. The client is implemented in **Python** as a lightweight interface.

## Architecture & SOLID Principles Analysis

Throughout the development of Exercise 2, we strictly adhered to the **Open-Closed Principle (OCP)**. Our code is open for extension but closed for modification. Here is an analysis of how our design from Ex1 supported the new Ex2 requirements:

### 1. Renaming Commands (`add` -> `POST`, `recommend` -> `GET`)
**Did it require modifying closed code?** No. 
**Explanation:** By utilizing the Command Design Pattern, the core execution engine (`App` or Invoker) maps string inputs to Command objects. To change the names, we only had to update the mapping keys (the string triggers) during the initialization phase, without touching the core logic of the command execution flow.

### 2. Adding New Commands (`PATCH`, `DELETE`)
**Did it require modifying closed code?** No.
**Explanation:** The command interface (`ICommand` or similar) remained completely untouched. To add new functionality, we simply created new classes (`PatchCommand.cpp`, `DeleteCommand.cpp`) that inherit from the base interface and registered them. The application logic executing the commands did not need to be altered.

### 3. Changing the Output Format
**Did it require modifying closed code?** No.
**Explanation:** The `execute()` method of each command is responsible for returning its specific string response. We updated the internal logic of the specific command classes to return the new HTTP-like status codes (e.g., `201 Created`, `204 No Content`). The interface contract between the commands and the invoker was preserved.

### 4. Moving from Console I/O to TCP Sockets
**Did it require modifying closed code?** No.
**Explanation:** Our application core does not depend on `std::cin` or `std::cout` directly. It processes string inputs and returns string outputs. We extended the system by introducing a `TcpServer` class that handles the network layer. It reads from the socket, passes the string to the application core, and writes the returned string back to the socket. The application core remained oblivious to the source of the I/O.

### 5. Future Extension: Multiple Concurrent Clients
**Is the current design ready for concurrency?** The business logic commands (Command Pattern) are decoupled and extendable. However, to support multiple concurrent clients, the `TcpServer` implementation will need to be extended (e.g., using `std::thread` per client or a thread pool). Furthermore, the `UsersRepository` and `FileStorage` will require thread synchronization mechanisms (like `std::mutex`) to prevent race conditions when multiple clients attempt to modify the `database.txt` file simultaneously. The architecture supports this extension gracefully without needing to rewrite the core logic.


## How to Build and Run

The project is fully dockerized.

### 1. Start the Server
Run the following command in the root directory to build and start the C++ server:
> docker-compose up --build server

*The server will start listening for connections on port 5555.*

### 2. Run the Client
Open a new terminal window and run the Python client:
> docker-compose run --build client 127.0.0.1 5555

*The client will connect on port 5555 and IP 127.0.0.1*

### 3. Run the Unit Tests (TDD)
To execute the Google Test suite for the server logic:
> docker-compose up --build tests