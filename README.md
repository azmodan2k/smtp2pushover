<!-- omit from toc -->
# smtp-pushover

smtp to pushover mail server with complete env or config implementation [pushover](https://pushover.net/)

- The destination email domain doesn't matter, smtppushover will forward all emails to passed appToken
- The subject of the email becomes the title of the push notification
- The contents of the email become the text of the push notification (html enabled if it is html)

<!-- omit from toc -->
## Overview

- [How do I use it?](#how-do-i-use-it)
  - [env configuration](#env-configuration)
  - [bind mount](#bind-mount)

## How do I use it?

Docker images are available at [Docker Hub](https://hub.docker.com/r/azmodan2k/smtp2pushover).

To use it with `docker compose`, you could configure it like with

### env configuration

```yaml
services:
  smtppushover:
    container_name: smtppushover
    hostname: smtppushover
    restart: always
    image: azmodan2k/smtp2pushover
    ports:
      - "25:25"
    environment:
      - pushover_usertoken=xxx
      - smtp_port=25 # optional, defaults to 25
      - smtp_authOptional=true # optional, defaults to true
      - smtp_secure=false # optional, defaults to false
      - smtp_allowInsecureAuth=false # optional, defaults to false
      - smtp_disabledCommands=xxx,yyy # optional, defaults to []
      - smtp_logger=true # optional, defaults to true
    cap_add:
        - NET_ADMIN
```

### bind mount

create a json config file

```json
{
    "smtpConfig": {
      "port": 25,
      "authOptional": true,
      "secure": false,
      "allowInsecureAuth": false,
      "logger": true
    },
    "pushoverConfig": {
      "userToken": "xxx"
    }
}
```

and bind mount it to docker container

```yaml
services:
  smtppushover:
    container_name: smtppushover
    hostname: smtppushover
    restart: always
    image: azmodan2k/smtp2pushover
    ports:
      - "25:25"
    volumes:
      - ./data/config.json:/app/config/config.json
      - /etc/localtime:/etc/localtime:ro      
    cap_add:
        - NET_ADMIN
```

start it with

```shell
docker compose up
```

Now, if you configure a smtp client to use localhost:25, you can send notifications with:

```shell
printf "To: apptoken1@whatever.domain\nTo: apptoken2@whatever.domain\nSubject: subject\n\n<b>text</b>\n" | msmtp -v --host localhost --port 25 --from from@test.com -t
```
