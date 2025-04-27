import requests
import openpyxl
import threading

# Configuration
SERVER_URL = "https://code-mafia.dynuddns.net/api"
LOGIN_ENDPOINT = "/auth/login"
EXCEL_FILE = "credentials.xlsx"
OUTPUT_FILE = "login_output.txt"

# Lock for writing to output file safely
output_lock = threading.Lock()

# Function to login and write the result to the output file
def login_and_write(username, password):
    try:
        # 1. Login
        login_url = SERVER_URL + LOGIN_ENDPOINT
        login_payload = {
            "username": username,
            "password": password
        }
        login_response = requests.post(login_url, json=login_payload)
        login_response.raise_for_status()  # If login fails, it will raise an error
        token = login_response.json().get("token")

        if not token:
            raise Exception(f"Token not received for {username}")

        message = f"[{username}] Login successful."

    except Exception as e:
        message = f"[{username}] Error: {str(e)}"

    # Write the message to the output file
    with open(OUTPUT_FILE, "a") as f:
        f.write(message + "\n")
    print(message)

# Main function
def main():
    # Clear the output file before starting
    open(OUTPUT_FILE, "w").close()

    workbook = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
    sheet = workbook.active

    users = []

    # Assuming first row is headers: team_name | mobile | password | username
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if row[2] is None or row[3] is None:
            continue  # skip if username or password missing

        password = row[2]
        username = row[3]
        users.append((username, password))

    # Login for each user without threading
    for username, password in users:
        login_and_write(username, password)

if __name__ == "__main__":
    main()
