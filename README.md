# Wolt

## About
A CLI application that manages user-product interactions 
and provides intelligent suggestions based on user behavior. 

## Commands
- `POST [userid] [productid1] [productid2] ...` - create new user and add the products the usew watched. if the user already exist return error 
- `PATCH [userid] [productid1] [productid2] ...` - Add products a user watched ,if the user not exist return error.
- `DELETE [userid] [productid1] [productid2] ...` - Delete the watched products user watched.
- `GET [userid] [productid]` - Get up to 10 product recommendations
- `help` - Print all available commands.

## How to Run

### Run the full app (Server + Client + Tests)
```bash
docker-compose up --build
```

### Run server + client only
```bash
docker-compose up --build server client
```

### Run the server only
```bash
docker-compose up --build server
```

### Run the client only
```bash
docker-compose run --rm client
```

### Run the tests
```bash
docker-compose up --build tests
```

### Stop the app
```bash
docker-compose down
```

## Example Run
```
```
## Open/Closed Principle

**1. Did the fact that the command names changed and added require you to modify code that is supposed to be 'closed for modification but open for extension'?**  
**No.**  
 We only changed the file and class names (e.g., to `PostCommand`) to make the codebase more intuitive and easier to work with. This was a cosmetic refactoring. The core execution logic of the application remained untouched. The only exception was the `HelpCommand`, which required internal modification to print the newly added commands.

**2. Did the fact that the output changed require you to modify code that is supposed to be 'closed for modification but open for extension'?**  
**No.**  
 We simply updated the specific string values returned by each command's execution method. The invoker (the `App` class) handles all commands uniformly through the `ICommand` interface, meaning the central architecture did not need to change at all just to return different text.

**3. Did the fact that the input/output comes from sockets instead of the terminal require you to modify code that is supposed to be 'closed for modification but open for extension'?**  
**Yes.**  
 In the previous assignment, our command methods returned `void` and printed directly to the terminal using `std::cout`. This violated OCP because changing the I/O method required rewriting the command classes themselves.  
**How we fixed it for the future:**  
 We refactored all functions to return a `std::string` instead of printing directly. Now, the commands are completely decoupled from the I/O mechanism. The `TcpServer` handles the network sockets, and the commands only process data and return strings. This means any future changes to the communication protocol will not require touching the command logic ever again.