-- Dispara um rebuild+redeploy do site (GitHub Actions repository_dispatch)
-- sempre que um artigo é criado, atualizado ou excluído.
--
-- O site agora é gerado como Next.js estático (output: 'export') e publicado
-- via FTP para a Hostinger — não há servidor Node/ISR rodando, então uma
-- edição no admin não aparece no site até um novo build+deploy acontecer.
-- Este trigger substitui isso automaticamente chamando a API do GitHub.
--
-- PRÉ-REQUISITO MANUAL (não é possível fazer via SQL/código):
--   1. Criar um GitHub Personal Access Token com permissão para disparar
--      Actions no repo (classic PAT com escopo "repo", ou fine-grained PAT
--      com "Actions: Read and write" no repositório do dpe-blog).
--   2. Guardar esse token no Supabase Vault:
--        select vault.create_secret('SEU_TOKEN_AQUI', 'github_dispatch_pat');
--   3. Confirmar que a extensão pg_net está habilitada no projeto
--      (Dashboard → Database → Extensions → pg_net).
--
-- Repositório: jvlunarlaunch/portaldpe

create extension if not exists pg_net with schema extensions;

create or replace function public.trigger_rebuild_on_article_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pat text;
begin
  select decrypted_secret into v_pat
  from vault.decrypted_secrets
  where name = 'github_dispatch_pat'
  limit 1;

  if v_pat is null then
    raise warning 'github_dispatch_pat não encontrado no Vault; rebuild automático não disparado.';
    return coalesce(new, old);
  end if;

  perform net.http_post(
    url := 'https://api.github.com/repos/jvlunarlaunch/portaldpe/dispatches',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_pat,
      'Accept', 'application/vnd.github+json',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('event_type', 'content-updated')
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists articles_rebuild_webhook on public.articles_portaldpe;

create trigger articles_rebuild_webhook
after insert or update or delete on public.articles_portaldpe
for each row
execute function public.trigger_rebuild_on_article_change();
