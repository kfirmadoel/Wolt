#include <iostream>
#include <map>
#include <set>
#include <string>
#include "App.h"
#include "AddCommand.h"
#include "HelpCommand.h"
#include "RecommendCommand.h"
#include "FileStorage.h"
#include "UsersRepository.h"

using namespace std;

int main() {
    // The central database structure we agreed upon
    FileStorage storage("data/users_db.txt");
    UsersRepository repository(storage);


    AddCommand addCmd(repository);
    RecommendCommand recommendCmd(repository);
    HelpCommand helpCmd;

    // 3. Register commands in the system
    map<string, ICommand*> commands;
    commands["add"] = &addCmd;
    commands["recommend"] = &recommendCmd;
    commands["help"] = &helpCmd;

    // 4. Run the application
    App app(commands);
    app.run(cin);

    return 0;
}