cmake_minimum_required(VERSION 3.10)
project(WoltCoreProject)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# --- Fetch GoogleTest for unit testing ---
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/heads/main.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# --- Set include directories ---
include_directories(.)

# --- Explicit list of source files (excluding main.cpp) ---
set(PROJECT_SOURCES
    core/App.cpp
    Tcp/TcpServer.cpp
    commands/GetCommand.cpp
    commands/PostCommand.cpp
    commands/PatchCommand.cpp
    commands/DeleteCommand.cpp
    commands/HelpCommand.cpp
    common/UserData.cpp
    common/UsersData.cpp
    Database/FileStorage.cpp
    Database/UsersRepository.cpp

)

# --- Build the main application ---
add_executable(server ${PROJECT_SOURCES} main.cpp)

# --- Explicit list of test files ---
set(TEST_SOURCES
    tests/commands/GetTest.cpp
    tests/commands/helpTest.cpp
    tests/commands/PostTest.cpp
    tests/Database/databaseTest.cpp
    tests/commands/PatchTest.cpp
    tests/commands/DeleteTest.cpp
    tests/appIntegrationTest.cpp
    tests/tcpServerIntegrationTest.cpp
)

# --- Build the test executable ---
 add_executable(wolt_tests ${PROJECT_SOURCES} ${TEST_SOURCES})
 target_link_libraries(wolt_tests GTest::gtest_main)