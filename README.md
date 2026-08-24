# Marrooks · To-do

Sobe o front (HTML) e o back (API) juntos, com um único compose na raiz.

```
marrooks-todo/
  docker-compose.yml   ← um comando sobe tudo
  api/                 ← Express + arquivo JSON (senha, tarefas, anotações)
  web/                 ← Nginx servindo o HTML e proxeando /api/ pro serviço api
```

## Subir

```bash
cd marrooks-todo
docker compose up -d --build
```

Isso builda as duas imagens e sobe dois containers na mesma rede Docker:
- `marrooks-todo-api` — só acessível dentro da rede (porta 3344, não publicada no host)
- `marrooks-todo-web` — Nginx publicado em `localhost:8080`, servindo o HTML e
  encaminhando `/api/*` internamente pro `api` (por isso o front chama `fetch('/api/...')`
  sem precisar saber onde o backend está)

Os dados (senha, tarefas, anotações) ficam em `./data/data.json` na raiz do projeto,
persistidos por volume — sobrevivem a rebuild.

## Colocando em marrooks.com

Esse stack já resolve tudo sozinho na porta 8080. Só falta apontar o domínio pra ela.
Duas formas, dependendo de como você já organiza o Nginx "de fora":

**Como subdomínio** (ex: `listas.marrooks.com`), no Nginx do host:
```nginx
server {
    server_name listas.marrooks.com;
    listen 80;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
(depois rode certbot pra HTTPS, como você já faz pro resto)

**Como um caminho dentro do site principal** (ex: `marrooks.com/todo`):
```nginx
location /todo/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Segurança

Senha em texto simples, comparação direta — proteção leve pra afastar curiosos,
não é criptografia de verdade. Dá pra evoluir depois com bcrypt e sessão se quiser.

## Nota

Montei e validei a API rodando de verdade (todos os endpoints testados). O compose
e o nginx.conf não deram pra testar aqui porque este ambiente não tem Docker — mas
seguem padrão simples e comum, seria bom rodar `docker compose up -d --build` e
conferir no seu VPS antes de apontar o domínio de vez.
