# Pflanzen Datenbank für Felix

&#169; 2019 by Schweitzer Productions

## Anforderungen

- Die DB soll wichtige Daten zu den Pflanzen anzeigen wie
  - Name (DEU, LAT)
  - Familien-Name (DEU, LAT)
  - ein Bild
  - besondere Ansprüche
  - Stammumfang
  - Alter
  - usw.
- Die DB soll möglichst aus dem Internet abrufbar sein
  - -> gehostet auf Chello
- Die Daten sollen zumindest über eine drittanbieterseite änderbar sein
  - entweder Sqlite-DB-Browser oder restdb.io Website
- Man soll nach den Eigenschaften suchen und filtern können
- Die Tabelle speichert ihren Zustand (state save)

## Lösungsvarianten

- html, js gehostet auf Chello mit jquery-datatables
- Daten entweder
  - auf chello in statischem json file
    - Daten einpflegen über Sqlite-DB-Browser und Export auf JSON
    - bzw. später Sqlite-auf-json-API auf eigenem Server im WLAN 
  - auf restdb.io via REST-API + JSON abrufbar (und wenn gewünscht änderbar)

## Einschränkungen, Known Bugs, Abstriche

- Die Datenstruktur wurde bewusst einfach gehalten und auf schöne Normalisierungen verzichtet
- aufgrund der Einschränkungen in sqlite bzw. in restdb.io sind nötige db-trigger nicht möglich (z.b um die Integrität der Deutsch-Latein Pärchen zu gewährleisten)

## Noch offene Todos, Wünsche

- Hintergrundfarbe der Überschrift auf Grün setzen (->Felix)
- Such-Drop-Down-Listen sind nicht gleich breit wie die Daten-Spalten (->Andi)
- Detail-Daten sollen noch angezeigt werden