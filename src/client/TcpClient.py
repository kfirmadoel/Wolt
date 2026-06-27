import sys
import socket

def main():
    # Get the server IP address and port number as command-line arguments
    if len(sys.argv) != 3:
        return

    server_ip = sys.argv[1]
    server_port = int(sys.argv[2])

    # Establish a TCP connection with the server
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.connect((server_ip, server_port))
        except Exception:
            return

        # The client uses the same connection throughout its runtime
        while True:
            try:
                # Wait for user input from the console (no prompt text)
                command = input()
                
                # Every command sent to the server ends with a newline character
                command_to_send = command + '\n'
                s.sendall(command_to_send.encode('utf-8'))

                # Wait for the server's response. Do not read the next command until it arrives
                response = s.recv(4096).decode('utf-8')
                if not response:
                    break
                
                # Print the result exactly as received from the server
                print(response, end='')

            except EOFError:
                break
            except KeyboardInterrupt:
                break

if __name__ == "__main__":
    main()