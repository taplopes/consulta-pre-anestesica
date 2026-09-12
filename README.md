# Consulta Pré-Anestésica

Aplicação web para agilizar a consulta de avaliação pré-anestésica, com cálculo automático de scores de risco e geração de relatório no formato do Serviço de Anestesiologia.

## Funcionalidades

- Formulário completo de avaliação pré-anestésica
- Cálculo automático de IMC e peso ideal
- Scores de risco automáticos: Apfel (NVPO), Lee's RCRI, ARISCAT, STOP-BANG, Caprini
- Alerta visual de alergias no relatório
- Geração de relatório final no modelo do serviço, com botão de copiar
- Interface responsiva (desktop e mobile)

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Deploy no GitHub Pages

O deploy é automático via GitHub Actions. Basta fazer push para a branch `main`.

### Configuração inicial (uma única vez):

1. No GitHub, ir a **Settings → Pages**
2. Em "Source", selecionar **GitHub Actions**
3. Fazer push do código — o workflow corre automaticamente
