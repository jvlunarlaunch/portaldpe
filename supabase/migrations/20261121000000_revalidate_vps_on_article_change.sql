-- Migração do site para a VPS (Next.js em servidor, com ISR).
--
-- APLICAR SÓ DEPOIS QUE O DNS DE portaldpe.com.br ESTIVER APONTANDO PARA A VPS.
--
-- Antes: cada mudança em artigo disparava um build completo no GitHub Actions
-- (repository_dispatch) e o site era reenviado por FTP para a Hostinger.
-- Agora: cada mudança chama POST https://portaldpe.com.br/api/revalidate/ e o
-- servidor refaz as páginas na próxima visita. Sem build, sem PAT do GitHub.
--
-- PRÉ-REQUISITO MANUAL: guardar no Vault o mesmo valor de REVALIDATE_SECRET
-- que está no arquivo /home/portaldpe/portaldpe.env da VPS:
--   select vault.create_secret('VALOR_DO_SEGREDO', 'portaldpe_revalidate_secret');

create extension if not exists pg_net with schema extensions;

create or replace function public.revalidate_site_on_article_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = 'portaldpe_revalidate_secret'
  limit 1;

  if v_secret is null then
    raise warning 'portaldpe_revalidate_secret não encontrado no Vault; revalidação não disparada.';
    return null;
  end if;

  perform net.http_post(
    url := 'https://portaldpe.com.br/api/revalidate/',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_secret,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );

  return null;
end;
$$;

-- Um disparo por comando (não por linha): salvar um artigo com várias
-- categorias continua gerando uma única chamada.
drop trigger if exists articles_revalidate_site on public.articles_portaldpe;
create trigger articles_revalidate_site
after insert or update or delete on public.articles_portaldpe
for each statement
execute function public.revalidate_site_on_article_change();

-- Mudanças só nas categorias de um artigo também alteram editorias e home.
drop trigger if exists article_categories_revalidate_site on public.article_categories;
create trigger article_categories_revalidate_site
after insert or update or delete on public.article_categories
for each statement
execute function public.revalidate_site_on_article_change();

-- O rebuild via GitHub Actions deixa de ser necessário.
drop trigger if exists articles_rebuild_webhook on public.articles_portaldpe;
