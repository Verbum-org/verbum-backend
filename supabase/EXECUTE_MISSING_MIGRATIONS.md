# 🚀 Como Executar as Migrations Faltantes

## 📊 Status Atual

Você tem **8 de 24 tabelas** criadas. Faltam **16 tabelas**.

---

## ✅ **Solução Rápida: Executar Todas as Migrations de Uma Vez**

### **Passo 1: Acessar o SQL Editor do Supabase**

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral esquerdo)
4. Clique em **New Query**

### **Passo 2: Executar Migrations Faltantes**

Execute **UMA POR VEZ** nesta ordem:

#### **1️⃣ Migration 010: Courses & Enrollments**

```bash
# No seu editor local, abra:
supabase/migrations/010_courses_schema.sql

# Copie TODO o conteúdo
# Cole no SQL Editor do Supabase
# Clique em "Run" (ou Ctrl+Enter)
```

#### **2️⃣ Migration 011: Progress & Activity Logs**

```bash
# Abra:
supabase/migrations/011_progress_schema.sql

# Copie e cole no SQL Editor
# Execute
```

#### **3️⃣ Migration 012: Webhooks**

```bash
# Abra:
supabase/migrations/012_webhooks_schema.sql

# Copie e cole no SQL Editor
# Execute
```

#### **4️⃣ Migration 013: Jobs**

```bash
# Abra:
supabase/migrations/013_jobs_schema.sql

# Copie e cole no SQL Editor
# Execute
```

#### **5️⃣ Migration 014: Moodle Integration**

```bash
# Abra:
supabase/migrations/014_moodle_integration_schema.sql

# Copie e cole no SQL Editor
# Execute
```

---

## 🔍 **Verificar se Deu Certo**

Após executar todas as migrations, volte ao SQL Editor e execute:

```sql
-- Copie e cole este script:
-- supabase/scripts/01_check_all_tables.sql
```

**Resultado Esperado:**

```json
{
  "total_esperado": 24,
  "total_criado": 24,
  "faltam": 0,
  "resultado": "✅ TODAS AS TABELAS CRIADAS!"
}
```

---

## 🐛 **Se Houver Erros**

### **Erro: "relation already exists"**

**Causa:** Tabela já foi criada.  
**Solução:** Ignore e continue com a próxima migration.

### **Erro: "column does not exist"**

**Causa:** Migration depende de uma anterior.  
**Solução:** Execute as migrations **na ordem correta** (010 → 011 → 012 → 013 → 014).

### **Erro: "permission denied"**

**Causa:** Você não está usando o usuário correto.  
**Solução:** Certifique-se de estar executando no **SQL Editor do Supabase** (não via backend).

---

## 📋 **Checklist de Execução**

- [ ] Migration 010 - Courses & Enrollments
- [ ] Migration 011 - Progress & Activity Logs
- [ ] Migration 012 - Webhooks
- [ ] Migration 013 - Jobs
- [ ] Migration 014 - Moodle Integration
- [ ] Verificação: `01_check_all_tables.sql` retorna 24 tabelas

---

## 💡 **Dica: Executar Tudo de Uma Vez (Avançado)**

Se você quiser executar todas de uma vez, eu posso criar um **script consolidado** que une todas as migrations em um único arquivo SQL. Quer que eu crie?

---

## 🎯 **Próximos Passos**

Após todas as migrations:

1. ✅ Execute `01_check_all_tables.sql` → Deve retornar 24 tabelas
2. ✅ Execute `02_verify_rls_policies.sql` → Verificar RLS
3. ✅ Execute `03_count_records.sql` → Ver se há dados
4. ✅ Teste o backend: `npm run start:dev`

---

**Bora executar! 🚀**

