# Activer les comptes (Supabase) — guide pas à pas

Tant que Supabase n'est pas configuré, WinFast fonctionne en **mode local**
(données dans le navigateur, un seul appareil, pas de compte). Dès que tu
renseignes les clés ci-dessous, l'app passe en **mode multi-utilisateurs** :
écran de connexion, données stockées par compte, copilote IA réservé aux
utilisateurs connectés.

## 1. Créer le projet Supabase
1. Va sur https://supabase.com → **New project** (plan gratuit).
2. Choisis un nom + un mot de passe de base de données, région Europe.
3. Attends ~2 min que le projet se provisionne.

## 2. Créer la table
1. Dashboard Supabase → **SQL Editor** → **New query**.
2. Copie tout le contenu de [`supabase/schema.sql`](supabase/schema.sql).
3. Colle-le et clique **Run**. (Crée la table `app_state` + la sécurité par ligne.)

## 3. Récupérer les clés
1. Dashboard → **Project Settings** → **API**.
2. Copie **Project URL** et la clé **anon public**.

## 4. Configurer l'app en local
Crée un fichier `.env.local` à la racine (copie de `.env.local.example`) :

```
ANTHROPIC_API_KEY=sk-ant-...          # optionnel (copilote IA)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Puis relance : `npm run dev`. Tu devrais être redirigé vers `/login`.

## 5. Inscription sans confirmation email (recommandé pour le MVP)
Par défaut Supabase demande de confirmer l'email. Pour que l'inscription
connecte directement :
- Dashboard → **Authentication** → **Providers** → **Email** →
  désactive **Confirm email** (puis Save).

(Tu pourras la réactiver plus tard quand tu brancheras un service d'envoi d'emails.)

## 6. Mise en ligne (Vercel)
1. Importe le repo GitHub sur https://vercel.com.
2. Dans **Settings → Environment Variables**, ajoute les 3 mêmes variables.
3. Déploie. Pense à ajouter l'URL de prod dans
   Supabase → **Authentication → URL Configuration** (Site URL + Redirect URLs).

---

### Ce qui reste pour la suite (hors MVP)
- Réactiver la confirmation email + service d'envoi (Resend).
- Rate-limiting et comptage de la conso IA par utilisateur.
- Paiement (Stripe) et plans gratuit / payant.
- Montée de version de Next.js (CVE).
