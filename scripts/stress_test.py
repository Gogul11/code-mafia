import requests
import openpyxl
import threading

# Configuration
SERVER_URL = "https://code-mafia.dynuddns.net/api"
LOGIN_ENDPOINT = "/auth/login"
SUBMIT_ENDPOINT = "/editor/submitquestion"
EXCEL_FILE = "credentials.xlsx"
OUTPUT_FILE = "stress_output.txt"

# Payload to submit
SUBMISSION_PAYLOAD = {
    "question_id": 6,
    "language_id": 54,
    "source_code": """def main():
    t = int(input())

    def orientation(x1, y1, x2, y2, x3, y3):
        return (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)

    def on_segment(x1, y1, x2, y2, x, y):
        return min(x1, x2) <= x <= max(x1, x2) and min(y1, y2) <= y <= max(y1, y2)

    out = []
    for _ in range(t):
        x1, y1, x2, y2, x3, y3, x4, y4 = map(int, input().split())

        o1 = orientation(x1, y1, x2, y2, x3, y3)
        o2 = orientation(x1, y1, x2, y2, x4, y4)
        o3 = orientation(x3, y3, x4, y4, x1, y1)
        o4 = orientation(x3, y3, x4, y4, x2, y2)

        intersect = False
        if o1 * o2 < 0 and o3 * o4 < 0:
            intersect = True
        elif o1 == 0 and on_segment(x1, y1, x2, y2, x3, y3):
            intersect = True
        elif o2 == 0 and on_segment(x1, y1, x2, y2, x4, y4):
            intersect = True
        elif o3 == 0 and on_segment(x3, y3, x4, y4, x1, y1):
            intersect = True
        elif o4 == 0 and on_segment(x3, y3, x4, y4, x2, y2):
            intersect = True

        out = "YES" if intersect else "NO"
        print(out)

main()
"""
}

# Lock for writing to output file safely from multiple threads
output_lock = threading.Lock()

# Function to login and submit for a user
def login_and_submit(username, password):
    try:
        # 1. Login
        login_url = SERVER_URL + LOGIN_ENDPOINT
        login_payload = {
            "username": username,
            "password": password
        }
        login_response = requests.post(login_url, json=login_payload)
        login_response.raise_for_status()
        token = login_response.json()["token"]

        message = f"[{username}] Login successful."

        # 2. Submit code
        submit_url = SERVER_URL + SUBMIT_ENDPOINT
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        submit_response = requests.post(submit_url, json=SUBMISSION_PAYLOAD, headers=headers)
        submit_response.raise_for_status()

        message += " Submission successful."

    except Exception as e:
        message = f"[{username}] Error: {str(e)}"

    # Write the message to the output file
    with output_lock:
        with open(OUTPUT_FILE, "a") as f:
            f.write(message + "\n")
        print(message)

# Read users and start threads
def main():
    # Clear the output file before starting
    open(OUTPUT_FILE, "w").close()

    workbook = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
    sheet = workbook.active

    threads = []

    # Assuming first row is headers: team_name | mobile | password | username
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if row[2] is None or row[3] is None:
            continue  # skip if username or password missing

        password = row[2]
        username = row[3]

        t = threading.Thread(target=login_and_submit, args=(username, password))
        t.start()
        threads.append(t)

    # Wait for all threads to finish
    for t in threads:
        t.join()

if __name__ == "__main__":
    main()
