# Deploy na VPS

O site roda como container Docker `portaldpe` em `127.0.0.1:3100`, atrás do
Caddy (HTTPS). Não mexe no Chatwoot (3000) nem na Evolution API (8080).

- **Código novo** (push em `main`): o GitHub Actions gera a imagem, envia para a
  VPS e troca o container (`deploy/deploy.sh`). Se a nova não responder, volta
  para a anterior sozinho.
- **Conteúdo novo** (artigo salvo no admin): o Supabase chama
  `POST /api/revalidate/` e as páginas são refeitas na próxima visita. Sem build.
- Agendados entram no ar sozinhos em até 5 min depois do `scheduled_at`.

## Preparação (uma vez, como root na VPS)

```bash
# 1. Chave SSH só para o deploy
sudo -u portaldpe mkdir -p -m 700 /home/portaldpe/.ssh
sudo -u portaldpe ssh-keygen -t ed25519 -N "" -C "github-actions-portaldpe" -f /home/portaldpe/.ssh/github_deploy
sudo -u portaldpe sh -c 'cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
cat /home/portaldpe/.ssh/github_deploy   # copiar para o segredo VPS_SSH_KEY e depois apagar:
rm /home/portaldpe/.ssh/github_deploy

# 2. Segredo da revalidação
SECRET=$(openssl rand -hex 32)
echo "REVALIDATE_SECRET=$SECRET" > /home/portaldpe/portaldpe.env
chown portaldpe:portaldpe /home/portaldpe/portaldpe.env && chmod 600 /home/portaldpe/portaldpe.env
echo "$SECRET"   # guardar para o Vault do Supabase
```

Segredos no GitHub (Settings → Secrets and variables → Actions):
`VPS_HOST` (IP da VPS) e `VPS_SSH_KEY` (a chave privada acima).

## Testar antes de mudar o DNS

```bash
curl -I http://127.0.0.1:3100/
curl -s http://127.0.0.1:3100/sitemap.xml | head
```

Para ver no navegador, do seu computador:
`ssh -L 3100:127.0.0.1:3100 root@IP_DA_VPS` e abra http://localhost:3100.

## Virada

1. `cp deploy/Caddyfile /etc/caddy/Caddyfile && caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy`
2. DNS: registros A de `portaldpe.com.br` e `www` → IP da VPS (remova AAAA antigos).
3. Quando `https://portaldpe.com.br` abrir pela VPS: no Supabase, guardar o
   segredo no Vault e aplicar `supabase/migrations/20261121000000_revalidate_vps_on_article_change.sql`.
4. Merge do PR em `main` (desliga o deploy da Hostinger).

## Comandos úteis

```bash
docker logs -f portaldpe          # logs do site
docker restart portaldpe          # reiniciar
docker stats portaldpe            # memória/CPU
```
