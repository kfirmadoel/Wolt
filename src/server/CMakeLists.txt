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
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/core
    ${CMAKE_CURRENT_SOURCE_DIR}/Tcp
    ${CMAKE_CURRENT_SOURCE_DIR}/commands
    ${CMAKE_CURRENT_SOURCE_DIR}/common
    ${CMAKE_CURRENT_SOURCE_DIR}/Database
)

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

enable_testing()

# --- Unit test files ---
set(UNIT_TEST_SOURCES
    tests/commands/GetTest.cpp
    tests/commands/helpTest.cpp
    tests/commands/PostTest.cpp
    tests/commands/PatchTest.cpp
    tests/commands/DeleteTest.cpp
    tests/Database/databaseTest.cpp
    tests/appTests.cpp
)

# --- Integration test files ---
set(INTEGRATION_TEST_SOURCES
    tests/appIntegrationTest.cpp
    tests/tcpServerIntegrationTest.cpp
)

# --- Project-level end-to-end tests ---
set(PROJECT_TEST_SOURCES
    tests/project/ProjectEndToEndTest.cpp
)

# --- Build the test executables ---
add_executable(wolt_unit_tests ${PROJECT_SOURCES} ${UNIT_TEST_SOURCES})
add_executable(wolt_integration_tests ${PROJECT_SOURCES} ${INTEGRATION_TEST_SOURCES})
add_executable(wolt_project_tests ${PROJECT_SOURCES} ${PROJECT_TEST_SOURCES})

target_link_libraries(wolt_unit_tests GTest::gtest_main)
target_link_libraries(wolt_integration_tests GTest::gtest_main)
target_link_libraries(wolt_project_tests GTest::gtest_main)

add_test(NAME unit_tests COMMAND wolt_unit_tests)
set_tests_properties(unit_tests PROPERTIES LABELS "unit")

add_test(NAME integration_tests COMMAND wolt_integration_tests)
set_tests_properties(integration_tests PROPERTIES LABELS "integration")

add_test(NAME project_tests COMMAND wolt_project_tests)
set_tests_properties(project_tests PROPERTIES LABELS "project")

# --- Convenience target to run all tests ---
add_custom_target(check
    COMMAND ${CMAKE_CTEST_COMMAND} --output-on-failure
    DEPENDS wolt_unit_tests wolt_integration_tests wolt_project_tests
)