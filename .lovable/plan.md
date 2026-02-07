
# Plano de Correção do Prompt ATC

## Problemas Identificados

| # | Problema | Causa Raiz | Evidência |
|---|----------|------------|-----------|
| 1 | ATC diz "Torre 118.1" quando é 118.700 | A IA não recebe a lista de frequências reais disponíveis | Imagem 1: Torre SBRF é 118.700 |
| 2 | ATC não questiona mudança de destino | Falta regra explícita para verificar consistência do destino | Imagem 3: Piloto disse SBRJ depois SBSP |
| 3 | ATC usa "Decolagem" em vez de "DEP/Controle" | Terminologia incorreta no prompt | Imagem 2: "Decolagem 119.1" |
| 4 | ATC manda contatar CTR que não existe | IA não sabe quais frequências estão disponíveis | Imagem 4: CTR sem frequência no seletor |

---

## Solução Técnica

### Arquivo 1: `supabase/functions/atc-chat/index.ts`

**Mudança Principal**: Injetar a lista completa de frequências REAIS disponíveis no contexto da IA.

O `frequencyContext` atual (linhas 714-743) diz qual frequência está sintonizada, mas NÃO informa quais frequências existem. A IA precisa saber:
- Quais setores têm frequência disponível
- Qual é a frequência EXATA de cada setor
- Se CTR não existe, ela não pode mandar contatar CTR

**Alterações no `frequencyContext`:**

```text
**FREQUÊNCIAS DISPONÍVEIS (DADOS REAIS - USE APENAS ESTAS):**
Aeroporto de Saída (${departureIcao}):
- ATIS: ${atis_freq ou 'INDISPONÍVEL'}
- CLR: ${clr_freq ou 'INDISPONÍVEL'}
- GND (Solo): ${gnd_freq ou 'INDISPONÍVEL'}
- TWR (Torre): ${twr_freq ou 'INDISPONÍVEL'}
- DEP (Controle/Departure): ${dep_freq ou 'INDISPONÍVEL'}
- CTR (Centro): ${ctr_freq ou 'INDISPONÍVEL'}

Aeroporto de Destino (${arrivalIcao}):
[mesma estrutura]

⚠️ REGRA CRÍTICA: 
- NUNCA invente frequências. Use APENAS as listadas acima.
- Se uma frequência está "INDISPONÍVEL", NÃO mande contatar esse setor.
- Ao transferir o piloto, use a frequência EXATA da lista.
```

**Lógica Necessária**: O edge function precisa receber as frequências dos dois aeroportos, não só a frequência selecionada. Isso requer:
1. Modificar o `ChatRequest` para incluir `departureFrequencies` e `arrivalFrequencies`
2. Modificar o frontend (`ChatScreen.tsx`) para enviar esses dados
3. Usar esses dados para construir o contexto

---

### Arquivo 2: `src/contexts/AppContext.tsx`

**Mudança no `DEFAULT_PROMPT`**: Adicionar regras de validação de destino e terminologia correta.

```text
## REGRAS DE VALIDAÇÃO CRÍTICAS

### Verificação de Destino
- O piloto informou destino no plano de voo: ${arrivalIcao}
- Se o piloto mencionar OUTRO destino, você DEVE questionar:
  "Confirme destino: você informou ${arrivalIcao} no plano de voo."
- NÃO aceite mudança de destino silenciosamente.

### Terminologia de Setores (ICAO)
- GND = "Solo" (Ground)
- TWR = "Torre" (Tower)  
- DEP = "Controle de Saída" ou "Departure" (NUNCA use "Decolagem")
- APP = "Aproximação" (Approach)
- CTR = "Centro" (Center)

### Uso de Frequências
- SEMPRE use frequências EXATAS do contexto de voo.
- NUNCA invente frequências.
- Se o setor não tiver frequência disponível (INDISPONÍVEL), NÃO transfira para ele.
- Exemplo: Se CTR está indisponível, mantenha em DEP ou informe "sem cobertura radar".
```

---

### Arquivo 3: `src/components/ChatScreen.tsx`

**Mudança**: Enviar frequências de ambos aeroportos para o edge function.

```typescript
body: JSON.stringify({
  // ... campos existentes ...
  departureFrequencies: departureAirport?.frequencies || [],
  arrivalFrequencies: arrivalAirport?.frequencies || [],
}),
```

---

## Resumo das Alterações

| Arquivo | Linhas Afetadas | Tipo |
|---------|-----------------|------|
| `atc-chat/index.ts` | ~714-750 (frequencyContext) | Expandir contexto com frequências reais |
| `atc-chat/index.ts` | ~50-68 (ChatRequest interface) | Adicionar campos de frequências |
| `AppContext.tsx` | ~29-59 (DEFAULT_PROMPT) | Adicionar regras de validação |
| `ChatScreen.tsx` | ~295-320 (fetch body) | Enviar frequências dos aeroportos |

---

## Riscos e Mitigação

| Risco | Mitigação |
|-------|-----------|
| Prompt muito longo | Formato compacto: lista simples de frequências |
| Usuários com prompt customizado | Regras críticas vão no edge function, não só no prompt |
| Aumento de tokens | Frequências são ~200 caracteres extras - impacto mínimo |

---

## Resultado Esperado

1. **Frequência correta**: "Chame Torre 118.700" (não 118.1)
2. **Validação de destino**: "Confirme destino: você informou SBRJ"
3. **Terminologia correta**: "Contato Controle Recife 128.200" (não "Decolagem")
4. **CTR ausente tratado**: "Mantemos em Controle, sem cobertura Centro nesta área"
