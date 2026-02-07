
# Avaliação Crítica das Melhorias Propostas

## Metodologia de Avaliação
Cada melhoria foi avaliada com base em:
- **Impacto**: Melhora real na experiência do usuário
- **Complexidade**: Quantidade de código afetado
- **Risco**: Chance de quebrar funcionalidades existentes

---

## Recomendação: Apenas via Prompt (Baixo Risco)

A maioria dessas melhorias são **comportamentais da IA**, não de código. A forma mais segura de implementá-las é ajustando o **system prompt** no `DEFAULT_PROMPT` (em `AppContext.tsx`) e/ou nas instruções dinâmicas enviadas à IA (em `atc-chat/index.ts`).

---

## Melhorias a Implementar (via Prompt)

| Melhoria | Justificativa | Local |
|----------|---------------|-------|
| Silêncio = confirmação | Evita verbosidade; padrão real de ATC | `DEFAULT_PROMPT` |
| QNH uma vez por fase/setor | Já há contexto de fase; basta instruir | `DEFAULT_PROMPT` |
| Readback só de autorizações | Regra clara e fácil de adicionar | `DEFAULT_PROMPT` |
| Minimizar fala em fases críticas | O sistema já sinaliza `silenceRequired` | `buildPhaseContext()` |
| Tratar erros de ditado como ruído | Já documentado em memória; formalizar no prompt | `DEFAULT_PROMPT` |
| Priorizar realismo sobre pedagogia | Ajuste de tom no prompt | `DEFAULT_PROMPT` |

---

## Melhorias a NÃO Implementar (Alto Risco / Baixo Benefício)

| Melhoria | Motivo para Rejeitar |
|----------|---------------------|
| "Aplicar mudanças imediatamente após feedback" | Isso é comportamento de sessão da IA, não algo que código controla. A IA já deveria fazer isso naturalmente. Adicionar regras explícitas pode gerar conflitos. |
| "Ajustar conforme nível do piloto" | Não há sistema de detecção de nível do piloto. Implementar isso exigiria lógica complexa de análise de histórico, fora do escopo. |
| "Manter padrão único até fim do voo" | Redundante com a instrução de consistência. A IA já recebe contexto de fase; forçar regras adicionais pode conflitar. |

---

## Alterações Propostas

### 1. Atualizar `DEFAULT_PROMPT` em `AppContext.tsx`

Adicionar seção nova com regras operacionais consolidadas:

```text
## REGRAS OPERACIONAIS DE COMUNICAÇÃO

### Confirmação de Readback
- **Silêncio = confirmação**: Após readback correto, NÃO confirme verbalmente.
- Fale APENAS para: nova instrução, correção, ou gatilho obrigatório.
- Não repita informações já estabilizadas (pista, QNH, altitude se já confirmados).

### Gestão de QNH
- Informe QNH UMA VEZ por fase/setor.
- Repita APENAS se: mudança de setor, mudança de fase (cruzeiro→descida), valor alterado, ou risco de erro vertical.
- Não use QNH como reforço didático.

### Readback e Autorização
- Exija readback APENAS de autorizações explícitas (altitude, proa, runway, clearance).
- NÃO cobre readback de "expectativas" (ex: "espere vetores").
- Diferencie: Autorização (exige readback) vs Informação (não exige).

### Fluxo Operacional
- Em fases críticas (final, pouso, taxi pós-pouso): comunicação mínima.
- Avaliações longas vão para debriefing, não durante a fase.

### Erros de Ditado/Áudio
- Distorções de transcrição (ex: "KNH" em vez de "QNH", "Kenya" por "Kilo") são RUÍDO de áudio.
- NÃO trate como erro conceitual se o contexto for inequívoco.
- Corrija forma APENAS quando comprometer segurança ou entendimento.

### Realismo Operacional
- Priorize realismo sobre pedagogia excessiva.
- Fraseologia seca e operacional. Evite verbos didáticos em excesso.
```

### 2. Atualizar instruções em `buildPhaseContext()` (linhas 366-392)

Adicionar regra de silêncio pós-readback para fases críticas:

```text
**REGRAS DE COMUNICAÇÃO PARA ESTA FASE:**
- ${phaseInfo.silenceRequired ? '⚠️ SILÊNCIO OBRIGATÓRIO - mínimo de comunicação' : 'Comunicação normal'}
- Após readback correto: SILÊNCIO (não confirme "correto", "afirmativo")
- QNH: Informar apenas SE ainda não foi dado neste setor
```

---

## Resumo das Alterações

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `src/contexts/AppContext.tsx` | Adicionar seção de regras operacionais ao `DEFAULT_PROMPT` |
| `supabase/functions/atc-chat/index.ts` | Adicionar dicas de comunicação no `buildPhaseContext()` |

**Total de linhas afetadas**: ~30 linhas (apenas adições ao prompt)

---

## Riscos Mitigados

1. **Sem alteração de lógica de código** - apenas texto de prompt
2. **Backward compatible** - usuários com prompts customizados não são afetados
3. **Facilmente reversível** - basta remover as linhas adicionadas
4. **Testável imediatamente** - mudanças refletem na próxima mensagem enviada

---

## Nota Importante

Usuários que já personalizaram o `systemPrompt` nas configurações **não verão essas mudanças** automaticamente, pois o prompt salvo tem precedência. O novo `DEFAULT_PROMPT` só afeta:
- Novos usuários
- Usuários que resetarem as configurações
- Usuários que clicarem em "Restaurar Padrão" (se existir tal opção)

Se quiser que as regras se apliquem a TODOS os usuários, seria necessário injetá-las no `fullSystemPrompt` do edge function, **após** o prompt do usuário. Isso é mais intrusivo mas garante aplicação universal.
