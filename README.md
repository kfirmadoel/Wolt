# Wolt
**instructions**
To start the project first build is with the command: docker build -t wolt-project .
Then to run the tests run the command: docker run -it wolt-project ./build/wolt_tests
To run the program run the command: docker run -it wolt-project
if you want run with option to close the running with ctrl+c run: docker run -it --init wolt-project