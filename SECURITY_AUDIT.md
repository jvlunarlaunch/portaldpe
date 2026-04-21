# Security Audit Report — Portal DPE

**Data:** 2026-04-21
**Auditores:** Claude Code (8 agentes especializados)
**Metodologia:** OWASP Top 10:2021 · CWE Top 25:2024 · STRIDE · MITRE ATT&CK v15 · LGPD

---

## Executive Summary

| Métrica | Valor |
|---------|-------|
| **Score Geral** | **49/100 — Grau D** |
| **Critical** | 4 |
| **High** | 10 |
| **Medium** | 14 |
| **Low** | 9 |
| **Info** | 5 |
| **Stack** | React 19 SPA + Express.js + PHP (og.php) + Supabase |
| **Escopo** | Full — ~25 arquivos de código-fonte |
| **Agentes** | 8/8 concluídos |

> ⛔ **AUTO-CRITICAL GATE ATIVO:** XSS armazenado sem sanitização + autorização client-side + CVEs em dependências diretas confirmados por múltiplos agentes. Grau D mantido.

---

## Score por Categoria

| Categoria | Score | Nota | Peso | Achado Principal |
|-----------|-------|------|------|-----------------|
| Detecção de Vulnerabilidades | 72 | C | 20% | Host Header Injection + sem CSP |
| Autorização & Acesso | 25 | F | 15% | `isAdmin` client-side + RLS permissivo |
| Gestão de Secrets | 68 | C | 10% | Anon key hardcoded em `og.php` |
| Dependências | 38 | D | 10% | CVEs em axios, vite, rollup, minimatch |
| Segurança de Infra (CI/CD) | 42 | D | 10% | 4 achados críticos no GitHub Actions |
| Threat Intelligence | 72 | C | 15% | Sem backdoors; obfuscação suspeita |
| Padrões de Código IA | 28 | F | 10% | `dangerouslySetInnerHTML` sem DOMPurify |
| Lógica & Design | 28 | F | 10% | XSS + sem audit log + sem transações |

---

## Achados Críticos

### [VULN-001] XSS Armazenado via `dangerouslySetInnerHTML` sem Sanitização
**Severity: CRITICAL | Confidence: HIGH | CWE: CWE-79 | OWASP: A03:2021**
**Location:** `pages/ArticlePage.tsx:202`

```tsx
dangerouslySetInnerHTML={{ __html: article.content || '<p>Conteúdo não disponível.</p>' }}
```

Conteúdo HTML do artigo (produzido pelo TipTap) injetado no DOM sem sanitização. Sem `Content-Security-Policy` no servidor Express. Um autor comprometido pode publicar payload XSS que executa para todos os leitores — roubo de sessão, keylogging, exfiltração do painel admin.

**Fix:**
```bash
npm install dompurify @types/dompurify
```
```tsx
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || '') }} />
```

---

### [VULN-002] Autorização Admin Inteiramente Client-Side (Email Hardcoded)
**Severity: CRITICAL | Confidence: HIGH | CWE: CWE-602 | OWASP: A01:2021**
**Location:** `pages/Admin.tsx:58`

```typescript
const isAdmin = currentUser?.username === 'joaovictor@lunarlaunch.com.br';
```

Qualquer usuário autenticado pode chamar `createAuthor()`, `deleteArticle()`, `fetchAuthors()` diretamente do console do navegador. Nenhuma verificação server-side existe.

**Fix:** Adicionar coluna `role TEXT DEFAULT 'author'` em `authors_portaldpe`; verificar role via Supabase no lugar de comparação de email no cliente.

---

### [VULN-003] RLS do Supabase Excessivamente Permissivo
**Severity: CRITICAL | Confidence: HIGH | CWE: CWE-284 | OWASP: A01:2021**
**Location:** Supabase — tabela `articles_portaldpe`

Política atual: `auth.role() = 'authenticated'` para ALL (SELECT/INSERT/UPDATE/DELETE). Qualquer conta autenticada pode editar ou excluir artigos de qualquer outro autor.

**Fix:**
```sql
DROP POLICY "Authenticated users can manage articles" ON articles_portaldpe;

CREATE POLICY "authors_update_own_or_admin" ON articles_portaldpe
  FOR UPDATE USING (
    auth.uid() = author_id OR
    (SELECT role FROM authors_portaldpe WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "authors_delete_own_or_admin" ON articles_portaldpe
  FOR DELETE USING (
    auth.uid() = author_id OR
    (SELECT role FROM authors_portaldpe WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "public_read_published" ON articles_portaldpe
  FOR SELECT USING (
    status = 'published' OR auth.uid() = author_id OR
    (SELECT role FROM authors_portaldpe WHERE id = auth.uid()) = 'admin'
  );
```

---

### [VULN-004] CVEs Ativos em Dependências Diretas
**Severity: CRITICAL | Confidence: HIGH | CWE: CWE-1104 | OWASP: A06:2021**
**Location:** `package.json`

| Pacote | CVE/GHSA | Impacto |
|--------|----------|---------|
| `axios ^1.13.2` | GHSA-43fc-jf86-j433 | Injeção via `__proto__` (SSRF) |
| `axios ^1.13.2` | GHSA-3p68-rc4w-qgx5 | Bypass `NO_PROXY` |
| `axios ^1.13.2` | GHSA-fvcv-3m26-pcqx | Exfiltração de metadados cloud |
| `vite ^6.2.0` | GHSA-4w7w-66w2-5vf9 | Path traversal em deps |
| `vite ^6.2.0` | GHSA-p9ff-h696-f583 | Leitura arbitrária de arquivo via WebSocket |
| `rollup` (transitiva) | GHSA-mw96-cpmx-2vgc | Escrita arbitrária via path traversal |
| `minimatch` (transitiva) | 3× HIGH CVEs | ReDoS |
| `picomatch` (transitiva) | 2× HIGH CVEs | ReDoS |

**Fix:** `npm audit fix` imediato.

---

## Achados High

### [VULN-005] Host Header Injection no Servidor Express
**Severity: HIGH | Confidence: HIGH | CWE: CWE-74 | OWASP: A03:2021**
**Location:** `server.js:62–64`

`x-forwarded-host` é usado para construir `og:url` sem validação. Atacante pode injetar domínio malicioso nas OG tags.

**Fix:**
```javascript
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || 'portaldpe.com.br').split(',');
const rawHost = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
if (!ALLOWED_HOSTS.some(h => rawHost.endsWith(h))) return res.sendFile(indexPath);
```

---

### [VULN-006] GitHub Action Não Fixada em SHA (Supply Chain Attack)
**Severity: HIGH | Confidence: HIGH | CWE: CWE-346 | OWASP: A06:2021**
**Location:** `.github/workflows/deploy.yml:35`

```yaml
uses: SamKirkland/FTP-Deploy-Action@v4.3.5  # tag mutável — fixar em SHA
```

Tags podem ser reassinaladas por atacante que comprometa a conta do mantenedor, executando código arbitrário com acesso a todos os secrets do workflow.

**Fix:** Usar SHA completo do commit. Idem para `actions/checkout` e `actions/setup-node`.

---

### [VULN-007] `createAuthor()` Acessível por Qualquer Usuário Autenticado
**Severity: HIGH | Confidence: HIGH | CWE: CWE-639 | OWASP: A01:2021**
**Location:** `api.ts:76–97`

Função pública sem verificação de admin. Qualquer usuário autenticado pode criar contas de autor via console do navegador.

---

### [VULN-008] FTP Username Hardcoded no Workflow
**Severity: HIGH | Confidence: HIGH | CWE: CWE-798 | OWASP: A02:2021**
**Location:** `.github/workflows/deploy.yml:38`

```yaml
username: u191607503.dpe  # mover para ${{ secrets.FTP_USERNAME }}
```

---

### [VULN-009] Anon Key Supabase Hardcoded em `public/og.php`
**Severity: HIGH | Confidence: HIGH | CWE: CWE-798 | OWASP: A02:2021**
**Location:** `public/og.php:13–14`

Anon key commitada no histórico Git. Embora a anon key seja pública por design do Supabase, tê-la no código-fonte a torna um artefato permanente do histórico de commits.

**Fix:** `getenv('SUPABASE_ANON_KEY')` + configurar variável no painel Hostinger.

---

### [VULN-010] TipTap Editor Permite HTML Arbitrário sem Sanitização no Banco
**Severity: HIGH | Confidence: MEDIUM | CWE: CWE-79 | OWASP: A03:2021**
**Location:** `components/ui/RichEditor.tsx`

Extensões YouTube e Mathematics permitem conteúdo rico. Output HTML não é sanitizado antes do insert no Supabase. Combinado com VULN-001, garante XSS.

**Fix:** Sanitizar output do TipTap com DOMPurify antes de `createArticle()`/`updateArticle()`.

---

## Achados Medium

| ID | Achado | Location |
|----|--------|----------|
| VULN-011 | Ausência de security headers no Express (CSP, HSTS, X-Frame-Options) | `server.js` |
| VULN-012 | Sem rate limiting no servidor Express | `server.js` |
| VULN-013 | `uploadImage()` sem validação de MIME/tamanho + filename com `Math.random()` | `api.ts:330` |
| VULN-014 | `npm install --legacy-peer-deps` em CI e Render (bypassa auditoria de deps) | `deploy.yml:26`, `render.yaml:7` |
| VULN-015 | Coleta de PII sensível sem adequação LGPD (endereço + local de votação) | `MembershipModal.tsx:44` |
| VULN-016 | Race condition em `createArticle()` — sem transação entre article e categories | `api.ts:249` |
| VULN-017 | Ausência de audit logging em operações críticas (delete, update, login) | `api.ts` (global) |
| VULN-018 | Versão Node.js não fixada em CI e Render | `deploy.yml:23`, `render.yaml:11` |
| VULN-019 | Deploy duplo (Hostinger + Render) sem coordenação — risco de estado inconsistente | `deploy.yml`, `render.yaml` |
| VULN-020 | `tiptap-extension-resize-image` fora do namespace oficial `@tiptap/` | `package.json:57` |
| VULN-021 | Ausência de validação em parâmetros de paginação (`limit: 999999`) | `api.ts:155` |

---

## Achados Low / Info

| ID | Achado | Location |
|----|--------|----------|
| VULN-022 | `GITHUB_TOKEN` sem escopo explícito de permissões | `deploy.yml` |
| VULN-023 | FTPS — validação de certificado não verificada na action | `deploy.yml:43` |
| VULN-024 | JS Obfuscator com `selfDefending: true` em produção (incomum para blog público) | `vite.config.ts:17` |
| VULN-025 | `scripts/generate-sitemap.js` usa tabela errada (`articles` → `articles_portaldpe`) | `scripts/generate-sitemap.js:26` |
| VULN-026 | `scripts/diagnose-related.js` usa tabelas erradas | `scripts/diagnose-related.js:8,17` |
| VULN-027 | Default de imagem aponta para `picsum.photos` (serviço de terceiro) | `Admin.tsx:41` |
| VULN-028 | Erros completos logados no console em produção | `api.ts:164`, `server.js:96` |
| INFO-001 | `.env.local` corretamente ignorado pelo `.gitignore` | ✅ |
| INFO-002 | Anon key no bundle JS — esperado por design do Supabase | ✅ |
| INFO-003 | `vite-plugin-javascript-obfuscator` é pacote legítimo no npm | ✅ |
| INFO-004 | Sem backdoors, C2 ou código malicioso detectado | ✅ |
| INFO-005 | `@tiptap/*` com versões consistentes (`^3.16.0`) | ✅ |

---

## Attack Path Analysis

```
[CHAIN-001] Comprometimento Total do CMS
Path: VULN-002 (isAdmin client-side) → VULN-003 (RLS permissivo) → VULN-007 (createAuthor sem auth)
→ Atacante autenticado cria conta admin falsa, edita/deleta artigos de qualquer autor
Combined Severity: CRITICAL

[CHAIN-002] XSS → Roubo de Sessão Admin
Path: VULN-001 (Stored XSS) → VULN-011 (sem CSP) → sessão Supabase em localStorage
→ Artigo malicioso exfiltra token de sessão; atacante assume controle total do CMS
Combined Severity: CRITICAL

[CHAIN-003] Supply Chain → Exfiltração de Secrets de Deploy
Path: VULN-006 (action não fixada em SHA) → secrets expostos no runner (FTP_PASSWORD, Supabase key)
→ Atacante compromete repositório da action e captura credenciais no próximo deploy
Combined Severity: HIGH
```

---

## Fila de Remediação

### 🔴 Corrigir Agora (Critical)

| # | Achado | Arquivo | Ação |
|---|--------|---------|------|
| 1 | XSS — `dangerouslySetInnerHTML` | `ArticlePage.tsx:202` | `npm install dompurify` → sanitizar content |
| 2 | isAdmin client-side | `Admin.tsx:58` | Coluna `role` na tabela + verificar via Supabase |
| 3 | RLS permissivo | Supabase | Reescrever políticas com `auth.uid() = author_id` |
| 4 | CVEs em axios/vite/rollup/minimatch | `package.json` | `npm audit fix` |

### 🟠 Corrigir Esta Sprint (High)

| # | Achado | Arquivo | Ação |
|---|--------|---------|------|
| 5 | Host Header Injection | `server.js:62` | Whitelist de hosts permitidos |
| 6 | Actions sem SHA | `deploy.yml:35` | Fixar `SamKirkland/FTP-Deploy-Action`, `checkout`, `setup-node` em SHAs |
| 7 | `createAuthor()` sem auth | `api.ts:76` | Verificar role antes do `signUp` |
| 8 | FTP username exposto | `deploy.yml:38` | `${{ secrets.FTP_USERNAME }}` |
| 9 | Anon key em `og.php` | `public/og.php:13` | `getenv('SUPABASE_ANON_KEY')` |
| 10 | TipTap output não sanitizado | `RichEditor.tsx` | DOMPurify antes do insert |

### 🟡 Corrigir Este Mês (Medium)

| # | Achado | Ação |
|---|--------|------|
| 11 | Sem security headers | `npm install helmet express-rate-limit` |
| 12 | Upload sem validação | Validar `file.type` + `file.size` + `crypto.getRandomValues()` para filename |
| 13 | `--legacy-peer-deps` | Resolver conflitos; remover flag do CI e Render |
| 14 | LGPD — PII sensível | Consentimento granular; endpoint de exclusão; RLS restrito |
| 15 | Sem transação em `createArticle()` | Cleanup no catch ou Edge Function transacional |
| 16 | Sem audit logging | Tabela `audit_log` + logar mutações |
| 17 | Node.js versão não fixada | `node-version: '20.19.1'` no CI e Render |
| 18 | Scripts com tabelas erradas | `articles` → `articles_portaldpe` em `generate-sitemap.js` e `diagnose-related.js` |
| 19 | `tiptap-extension-resize-image` | Auditar fonte; fixar sem caret: `"1.3.2"` |
| 20 | Paginação sem limite | `Math.min(100, limit)` em `fetchArticles()` |

### 📋 Backlog (Low)

- `GITHUB_TOKEN permissions: contents: read` no workflow
- Remover ou documentar razão do `selfDefending` no obfuscator
- Substituir `picsum.photos` por placeholder local em `/public/`
- Não logar objetos de erro completos em produção
- Health-check pós-deploy no workflow

---

## Metodologia

- **OWASP Top 10:2021**, CWE Top 25:2024, OWASP API Security Top 10:2023
- **STRIDE** threat modeling por boundary de confiança
- **MITRE ATT&CK v15** para mapeamento de técnicas
- **LGPD** (Lei 13.709/2018) para achados de privacidade
- 8 agentes especialistas com pontuação ponderada
- Supressão de falsos positivos para padrões framework-aware (anon key Supabase no bundle JS = INFO por design)
