# ЧҮКӨ Modern 3D — LMS API / integration contract

Этот файл описывает фактический контракт текущего `lms-adapter.js`.

> **Обновлено по образцу Mahjong Luck / Upay / ЧҮКӨ-ОРДО (та же общая
> X2-интеграция, синхронизировано по их итогам):** авторизация теперь
> через cookie (`sessionMode: 'cookie'`), а не через postMessage-токен
> (см. §2/§3 ниже — их рекомендация уже устарела); `scenario` в ответе
> PayTicket реально приходит массивом `[id, 0]`, а не голым числом (см.
> §6); `Method=Balance` для keep-alive сессии существует (было
> задокументировано как несуществующее — см. §4). Также: таблица
> scenario mapping в §7 не совпадает с актуальным
> `src/scenario-config.js` (там id 1..9 с другими ключами/множителями) —
> этот документ, судя по всему, писался под более раннюю версию
> сценариев и не обновлялся вместе с ней; сверяйте §7 с
> `scenario-config.js` напрямую, а не с этим файлом.

## 1. Источник истины

В REAL режиме LMS определяет:

```text
ticketId
scenario
win
balance
```

Игра не рассчитывает REAL payout.

---

## 2. Инициализация

Рекомендуемый production режим:

```js
initMode: 'postMessage'
sessionMode: 'cookie'
mock: false
```

Игра отправляет:

```js
{
  source:'X2_CHUKO',
  type:'X2_GAME_READY',
  gameId:'CHUKO',
  needsInit:true,
  needsSession:true
}
```

Родитель отвечает:

```js
{
  type:'X2_LMS_INIT',
  session:'...',
  gameId:'...',
  denomination:25,
  denominations:[25,50,100],
  currency:'KGS',
  currencyDisplay:'сом',
  language:'RU',
  mode:'real',
  demoAllowed:true,
  demoBalance:10000,
  balance:1000
}
```

### Важное замечание о `gameId`

Текущий `game.js` при покупке билета использует `X2_GAME_CONFIG.gameId`. Поэтому production ID игры необходимо установить в `lms-config.js`.

---

## 3. Session

При `sessionMode:'cookie'` (текущий рекомендуемый режим) отдельного
токена нет вовсе — авторизация идёт через cookie браузера, `fetch`
выполняется с:

```js
credentials:'include'
```

**Условие:** игра должна быть развёрнута на том же домене, что и сам
сайт LMS — иначе браузер (Safari ITP, SameSite) не пришлёт cookie в
кросс-доменном iframe, и все запросы будут молча уходить
неавторизованными.

Если вместо этого используется `sessionMode:'postMessage'` (устаревший
режим, оставлен для совместимости), session передаётся в
`X2_LMS_INIT.session` или отдельным:

```js
{ type:'X2_LMS_SESSION', session:'...' }
```

и adapter передаёт его в заголовке (имя задаётся `sessionHeader`):

```http
X-Session-ID: <session>
```

---

## 4. Баланс: старт, PayTicket и keep-alive

REAL initial balance должен прийти в:

```text
X2_LMS_INIT.balance
```

После каждого билета новый точный баланс обязан прийти в PayTicket response.

**Отдельный эндпоинт «получить баланс» существует** — `Method=Balance`
(в отличие от того, что было написано здесь раньше). Тот же URL, что и
PayTicket (`cfg.endpoints.newGame`), только `Method=Balance`:

```
GET <endpoints.newGame>?Method=Balance&idIG=<idIG>&idSK=<idSK>
```

| Параметр | Тип | Обязательный | Описание |
|---|---|---|---|
| `Method` | string | да | Всегда `Balance`. |
| `idIG` | number | — | Идентификатор игрока. |
| `idSK` | number | нет | Идентификатор счёта — если передан, в ответе только этот счёт, иначе все счета игрока. |

Успешный ответ:
```json
{ "idIG": "идентификатор игрока", "Accounts": [
  { "idSK": "идентификатор счета", "Balans": "остаток на счете",
    "Bonus": "остаток бонусов", "played_out": "отыграно бонусов",
    "Currency": "валюта" }
] }
```
Ошибка — судя по документации, **HTTP 200** с телом `{"Error": "..."}`
(не статус-код, как у PayTicket из §5) — уточните, если это не так.

Игра дёргает `Method=Balance` раз в ~5 минут (`X2LMS.getBalance()` +
`startBalancePolling()` в `src/game.js`) — пока вкладка открыта и видна,
без активного розыгрыша — не для отображения баланса как такового, а
чтобы держать LMS-сессию живой: любой авторизованный запрос сбрасывает
15-минутный таймер неактивности сессии (подтверждено бэкендом), а без
этого игрок, отвлёкшийся более чем на 15 минут, мог бы упереться в
протухшую сессию на следующем PayTicket, хотя его логин на сайте живёт
30 дней.

**Открытый вопрос:** PayTicket обходится без `idIG` — игрок
определяется по cookie-сессии. Нужно подтвердить, что `Method=Balance`
ведёт себя так же (сессии достаточно, `idIG` можно не передавать), либо
прислать, как игре получить `idIG` (например, добавить в
`X2_LMS_INIT`) — сейчас игра его никак не получает.

---

## 5. PayTicket

Запрос:

```http
GET <endpoints.newGame>?Method=PayTicket&gameId=<gameId>&amount=<denomination>
```

Пример:

```http
GET /api/Lotto.Users.cls?Method=PayTicket&gameId=137&amount=25
```

`137` здесь только пример формата. Использовать фактический ID LMS.

---

## 6. Ответ PayTicket

Рекомендуемый canonical response:

```json
{
  "ticketId": "T-123456",
  "scenario": [3, 0],
  "win": 50,
  "balance": 1425,
  "currency": "KGS",
  "currencyDisplay": "сом",
  "denomination": 25
}
```

**`scenario` реально приходит массивом `[id, unused]`** (подтверждено
бэкендом для той же линейки X2 LOTO), не голым числом, как показано в
исходном контракте. Используется только первый элемент; второй эта
игра не задействует и игнорирует. Adapter (`normalizeTicket()` в
`lms-adapter.js`) на всякий случай всё ещё принимает и голое число
тоже, для обратной совместимости.

Допускаемые aliases adapter:

| Значение | Поддерживаемые ключи |
|---|---|
| ticket | `ticketId`, `ticket_id`, `ticketNumber`, `ticket_number` |
| scenario | `scenario` (массив `[id, unused]` или голое число), `scenarioId`, `scenario_id`, `scenarioKey` |
| win | `win`, `prize`, `winAmount` |
| balance | `balance`, `newBalance`, `balanceAfterGame` |

`denomination`, `currency`, `currencyDisplay` могут присутствовать; при отсутствии используются request/init values.

---

## 7. Scenario mapping

```text
1  ZERO        -> 0
2  ONE         -> 1
8  ONE_KHAN    -> 1 + KHAN
3  TWO         -> 2
9  TWO_KHAN    -> 2 + KHAN
6  THREE       -> 3
10 THREE_KHAN  -> 3 + KHAN
7  FOUR        -> 4
11 FOUR_KHAN   -> 4 + KHAN
4  FIVE        -> 5
5  FIVE_KHAN   -> 5 + KHAN
```

Adapter принимает numeric ID или string key.

ID 1..7 сохранены для обратной совместимости. Новые сценарии `ONE_KHAN`, `TWO_KHAN`, `THREE_KHAN`, `FOUR_KHAN` используют ID 8..11.

---

## 8. Валидация ответа

Adapter отклоняет билет при:

```text
нет ticketId     -> BAD_TICKET_RESPONSE
unknown scenario -> BAD_SCENARIO_RESPONSE
invalid win      -> BAD_WIN_RESPONSE
нет balance      -> BAD_BALANCE_RESPONSE
```

Такой раунд не должен начинаться.

---

## 9. Баланс и timing

При получении билета:

- точный LMS balance сохраняется как pending;
- клиентская визуализация проходит до конца;
- только затем UI устанавливает этот balance;
- `X2_GAME_ROUND_COMPLETE` содержит тот же итоговый balance.

При неуспешном PayTicket оптимистично вычтенная в UI ставка возвращается.

---

## 10. Events game -> parent

### READY

```text
X2_GAME_READY
```

### BALANCE

```text
X2_GAME_BALANCE_LOADED
```

### SETTINGS

```text
X2_GAME_DENOMINATION_CHANGED
X2_GAME_MODE_CHANGED
```

### TICKET

```text
X2_GAME_TICKET_READY
```

### ROUND

```text
X2_GAME_ROUND_COMPLETE
```

Round complete payload содержит:

```text
gameId
ticketId
scenario
scenarioKey
win
balance
denomination
currency
currencyDisplay
language
mode
```

### UI actions

```text
X2_GAME_DEPOSIT_REQUEST
X2_GAME_HELP_REQUEST
```

### Technical errors

```text
X2_GAME_ERROR
```

`X2_GAME_ERROR` предназначен для интеграции/телеметрии. **Не показывать raw `code/message` игроку.**

---

## 11. HTTP errors

Adapter нормализует:

```text
401 -> SESSION_EXPIRED
409 -> INSUFFICIENT_FUNDS
other non-2xx -> LMS_HTTP_<status>
request timeout -> LMS_TIMEOUT
```

Если сервер сам возвращает `code`, он имеет приоритет.

---

## 12. CORS

При cross-origin и `credentials:'include'`:

- `Access-Control-Allow-Origin` = конкретный game origin;
- `Access-Control-Allow-Credentials: true`;
- разрешить GET/OPTIONS;
- если session в header — разрешить `X-Session-ID`.

---

## 13. Mock / QA

Static config:

```js
mock: true
```

URL может переопределить mock:

```text
?mock=false
```

Для production обязательное состояние — `mock:false` и отсутствие тестового query override.

Для QA scenario можно форсировать:

```text
?scenario=ZERO
?scenario=ONE_KHAN
?scenario=TWO_KHAN
?scenario=THREE_KHAN
?scenario=FOUR_KHAN
?scenario=FIVE_KHAN
```

---

## 14. Что считается production ошибкой, а что диагностикой

Финансовые/сессионные ошибки могут остановить новый раунд.

Визуальный диагностический сигнал не должен менять LMS ticket result и не должен показываться игроку как технический код.

Текущая сборка также может отправить `SCENARIO_FORCED_COMPLETE` через `X2_GAME_ERROR`, если визуальный сценарий пришлось завершить резервным путём. Это событие следует логировать для QA/monitoring, но не выводить пользователю.
