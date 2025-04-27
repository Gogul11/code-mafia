import requests
import openpyxl

# Configuration
SERVER_URL = "https://code-mafia.dynuddns.net/api"
ADMIN_LOGIN_ENDPOINT = "/auth/login"
SIGNUP_ENDPOINT = "/auth/signup"
EXCEL_FILE = "credentials.xlsx"
OUTPUT_FILE = "output.txt"

# 1. Login as admin
def login_admin(username, password):
    url = SERVER_URL + ADMIN_LOGIN_ENDPOINT
    payload = {
        "username": username,
        "password": password
    }
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()["token"]

# 2. Signup users from Excel
def signup_users(token):
    url = SERVER_URL + SIGNUP_ENDPOINT

    workbook = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
    sheet = workbook.active

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    with open(OUTPUT_FILE, "w") as log_file:
        # Assuming first row is headers: team_name | mobile | password | username
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if row[0] is None or row[2] is None or row[3] is None:
                continue  # skip if important fields are missing

            team_name = row[0]
            mobile = row[1]  # not actually used in payload
            password = row[2]
            username = row[3]

            payload = {
                "username": username,
                "password": password,
                "confirmPassword": password,
                "team_name": team_name
            }

            try:
                response = requests.post(url, json=payload, headers=headers)
                response.raise_for_status()
                success_message = f"Successfully signed up user: {username}"
                print(success_message)
                log_file.write(success_message + "\n")
            except requests.exceptions.HTTPError as err:
                error_message = f"Failed to signup user {username}: {err.response.text}"
                print(error_message)
                log_file.write(error_message + "\n")

def main():
    admin_username = input("Enter admin username: ")
    admin_password = input("Enter admin password: ")

    try:
        token = login_admin(admin_username, admin_password)
        print("Admin login successful. Token received.")
        with open(OUTPUT_FILE, "w") as log_file:
            log_file.write("Admin login successful. Token received.\n")
        signup_users(token)
    except Exception as e:
        error_message = f"Error during process: {e}"
        print(error_message)
        with open(OUTPUT_FILE, "w") as log_file:
            log_file.write(error_message + "\n")

if __name__ == "__main__":
    main()
