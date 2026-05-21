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
include_directories(src src/common src/Database src/core tests .)

# --- Glob all source files in the src directory ---
file(GLOB_RECURSE PROJECT_SOURCES "src/*.cpp")

# --- Remove main.cpp from the sources for the test executable ---
list(REMOVE_ITEM PROJECT_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp")

# --- Build the main application ---
add_executable(wolt_app ${PROJECT_SOURCES} "${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp")

# --- Build the test executable ---
file(GLOB_RECURSE ALL_TESTS "tests/*.cpp")
add_executable(wolt_tests ${PROJECT_SOURCES} ${ALL_TESTS})
target_link_libraries(wolt_tests GTest::gtest_main)