# Деплой rublestore.ru на сервер с SSL

Сервер: **155.117.46.144**  
Домен: **rublestore.ru**

---

## 1. Настройка DNS в Reg.ru

1. Зайдите в [Reg.ru](https://www.reg.ru) → **Домены** → выберите **rublestore.ru**.
2. В блоке **«DNS-серверы и управление зоной»** нажмите **«Изменить»** (или перейдите в управление зоной).
3. Добавьте/измените **A-записи**:

   | Тип | Поддомен | Значение        | TTL  |
   |-----|----------|-----------------|------|
   | A   | @        | 155.117.46.144  | 3600 |
   | A   | www      | 155.117.46.144  | 3600 |

4. Сохраните изменения. Обновление DNS может занять от нескольких минут до 24 часов.

Проверка (через некоторое время):
```bash
ping rublestore.ru
# Должен отвечать 155.117.46.144
```

---

## 2. Подготовка сервера (один раз)

Подключитесь по SSH:
```bash
ssh user@155.117.46.144
```

Установите Docker, Docker Compose, Nginx и Certbot (если ещё не установлены):

**Debian/Ubuntu:**
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx docker.io docker-compose-plugin
sudo systemctl enable nginx
sudo systemctl enable docker
```

---

## 3. Деплой приложения (Docker на порту 3002)

```bash
cd /opt   # или ваша рабочая папка
sudo git clone https://github.com/hashc0d3/RUBLESTORE.git
cd RUBLESTORE
sudo docker compose up -d --build
```

Проверьте: `http://155.117.46.144:3002` должен открывать сайт.

---

## 4. Nginx как обратный прокси и SSL (Let's Encrypt)

Создайте конфиг Nginx на сервере:

```bash
sudo nano /etc/nginx/sites-available/rublestore.ru
```

Вставьте (замените `rublestore.ru` на ваш домен, если другой):

```nginx
server {
    listen 80;
    server_name rublestore.ru www.rublestore.ru;
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Включите сайт и проверьте конфиг:

```bash
sudo ln -sf /etc/nginx/sites-available/rublestore.ru /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Получите SSL-сертификат (Certbot сам настроит HTTPS в этом конфиге):

```bash
sudo certbot --nginx -d rublestore.ru -d www.rublestore.ru
```

Следуйте подсказкам (email, согласие с условиями). Certbot настроит редирект HTTP → HTTPS.

**Если certbot выдаёт `AttributeError: can't set attribute`** — используйте режим standalone:

```bash
# 1. Временно остановить nginx
sudo systemctl stop nginx

# 2. Получить сертификат (certbot поднимет свой временный веб-сервер на 80)
sudo certbot certonly --standalone -d rublestore.ru -d www.rublestore.ru

# 3. Запустить nginx обратно
sudo systemctl start nginx
```

Затем вручную добавьте HTTPS в конфиг nginx (см. ниже блок `server { listen 443 ... }` в разделе «Ручная настройка SSL»).

Проверка:
- https://rublestore.ru
- https://www.rublestore.ru

---

### Ручная настройка SSL (если использовали certbot --standalone)

После получения сертификата отредактируйте `/etc/nginx/sites-available/rublestore.ru`:

```nginx
server {
    listen 80;
    server_name rublestore.ru www.rublestore.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name rublestore.ru www.rublestore.ru;

    ssl_certificate     /etc/letsencrypt/live/rublestore.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rublestore.ru/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Затем: `sudo nginx -t && sudo systemctl reload nginx`

---

## 5. Обновление сайта после изменений

```bash
cd /opt/RUBLESTORE
sudo git pull origin main
sudo docker compose up -d --build
```

Nginx и SSL трогать не нужно.

---

## Краткая шпаргалка

| Задача              | Команды |
|---------------------|--------|
| DNS                 | Reg.ru → домен → зона DNS → A @ и www → 155.117.46.144 |
| Первый деплой       | `git clone ...`, `cd RUBLESTORE`, `docker compose up -d --build` |
| Nginx + SSL         | Конфиг выше в sites-available → `certbot --nginx -d rublestore.ru -d www.rublestore.ru` |
| Обновление кода     | `git pull`, `docker compose up -d --build` |
