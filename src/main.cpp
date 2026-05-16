#include <iostream>
#include <map>
#include <set>
#include <string>
#include "App.h"
#include "AddCommand.h"
#include "HelpCommand.h"
//#include "DataManager.h" // The module provided by the "Data Person"

using namespace std;

int main() {
    // The central database structure we agreed upon
    map<int, set<int>> database;

// 1. Get the fully populated database from the Data module
    // The DataManager is now responsible for creating the map
    //map<int, set<int>> database = DataManager::loadAllData();

    // 2. Instantiate command objects with the shared database
    AddCommand addCmd(database);
    HelpCommand helpCmd;

    // 3. Register commands in the system
    map<string, ICommand*> commands;
    commands["add"] = &addCmd;
    commands["help"] = &helpCmd;

    // 4. Run the application
    App app(commands);
    app.run(cin);

    return 0;
}