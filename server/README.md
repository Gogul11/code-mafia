This is the server side of the application.

Prerequisites:
 1) Running instance of judge0.

To install judge0 locally:

System Requirements
Please note that Judge0 has only been tested on Linux and might not work on other systems; thus, we do not provide support for it.

We recommend using Ubuntu 22.04, on which you need to do the following update of GRUB:

Use sudo to open file ```/etc/default/grub```
Add ```systemd.unified_cgroup_hierarchy=0``` in the value of ```GRUB_CMDLINE_LINUX variable```.
Apply the changes: ```sudo update-grub```
Restart your server: ```sudo reboot```
Additionally, make sure you have Docker and Docker Compose installed.

Deployment Steps
Download and extract the release archive:
```wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip```
```unzip judge0-v1.13.1.zip```
Visit this website to generate a random password.
Use the generated password to update the variable ```REDIS_PASSWORD``` in the ```judge0.conf``` file.
Visit again this website to generate another random password.
Use the generated password to update the variable ```POSTGRES_PASSWORD``` in the ```judge0.conf``` file.

Run all services and wait a few seconds until everything is initialized:
```
cd judge0-v1.13.1
docker-compose up -d db redis
sleep 10s
docker-compose up -d
sleep 5s
```
Your instance of Judge0 CE v1.13.1 is now up and running; visit docs at http://<IP ADDRESS OF YOUR SERVER>:2358/docs.


Steps for setup:
 1) use ```npi i``` to download all the dependencies.
 2) Create a ```.env``` file in /client directory. [Same level as package.json]
 3) use ```node server.js``` to run the server.

Contents in ENV:
 1) PORT=
 2) JUDGE_ZERO_API=""
 3) X_AUTH_TOKEN=""

API Documentation:
[To be continued...]