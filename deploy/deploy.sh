#!/usr/bin/env bash
# Roda NA VPS, como o usuário portaldpe, chamado pelo GitHub Actions.
# Carrega a imagem nova, troca o container e volta para a anterior se a nova
# não responder. Só mexe em containers/imagens chamados "portaldpe".
set -euo pipefail

NEW_TAG="$1"                         # ex.: portaldpe:3f2a1bc
ENV_FILE="$HOME/portaldpe.env"       # contém REVALIDATE_SECRET
NAME=portaldpe
PORT=3100

gunzip -c "$HOME/portaldpe-image.tar.gz" | docker load
rm -f "$HOME/portaldpe-image.tar.gz"

PREV_IMAGE="$(docker inspect --format '{{.Config.Image}}' "$NAME" 2>/dev/null || true)"

run() {
  docker run -d --name "$NAME" \
    --restart unless-stopped \
    -p 127.0.0.1:$PORT:3000 \
    --memory 1g --memory-swap 1g --cpus 2 \
    --env-file "$ENV_FILE" \
    --log-opt max-size=10m --log-opt max-file=3 \
    "$1"
}

docker rm -f "$NAME" >/dev/null 2>&1 || true
run "$NEW_TAG"

for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/robots.txt"; then
    echo "OK: $NEW_TAG no ar em 127.0.0.1:$PORT"
    # Mantém só a imagem atual e a anterior (para rollback).
    docker images "$NAME" --format '{{.Repository}}:{{.Tag}}' \
      | grep -vx -e "$NEW_TAG" -e "${PREV_IMAGE:-none}" -e "$NAME:latest" \
      | xargs -r docker rmi >/dev/null 2>&1 || true
    docker tag "$NEW_TAG" "$NAME:latest"
    exit 0
  fi
  sleep 2
done

echo "ERRO: $NEW_TAG não respondeu. Logs:" >&2
docker logs --tail 50 "$NAME" >&2 || true
if [ -n "$PREV_IMAGE" ]; then
  echo "Voltando para $PREV_IMAGE" >&2
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  run "$PREV_IMAGE"
fi
exit 1
