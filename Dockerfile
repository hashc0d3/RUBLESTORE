# Продакшен: статический сайт на nginx
FROM nginx:alpine

# Удаляем дефолтную конфигурацию и копируем нашу
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем файлы сайта (остальное — в .dockerignore)
COPY index.html styles.css script.js favicon.svg RUBLESTORE.mov price1.jpg price2.jpg /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
