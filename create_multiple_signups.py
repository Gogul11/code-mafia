import requests
import openpyxl

# Configuration
SERVER_URL = "https://code-mafia.dynuddns.net/api"
ADMIN_LOGIN_ENDPOINT = "/auth/login"
SIGNUP_ENDPOINT = "/auth/signup"
EXCEL_FILE = "credentials.xlsx"

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

    workbook = openpyxl.load_workbook(EXCEL_FILE)
    sheet = workbook.active

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Assuming first row is headers: username | password | confirmPassword | team_name
    for row in sheet.iter_rows(min_row=2, values_only=True):
        username, password, confirmPassword, team_name = row

        payload = {
            "username": username,
            "password": password,
            "confirmPassword": confirmPassword,
            "team_name": team_name
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"Successfully signed up user: {username}")
        except requests.exceptions.HTTPError as err:
            print(f"Failed to signup user {username}: {err.response.text}")

def main():
    admin_username = input("Enter admin username: ")
    admin_password = input("Enter admin password: ")

    try:
        token = login_admin(admin_username, admin_password)
        print("Admin login successful. Token received.")
        signup_users(token)
    except Exception as e:
        print(f"Error during process: {e}")

if __name__ == "__main__":
    main()
