# Kitty 🐷

App (Ionic + Angular, PWA) para dividir despesas em grupo. A API fica no repositório irmão `../kitty-api`.

```bash
cd app && npm install && npm start   # http://localhost:4200
```

A URL da API fica em `app/src/environments/`.

## App nativo (iOS e Android)

O app usa o Capacitor. As pastas `app/ios` e `app/android` são projetos nativos completos.

```bash
cd app
npm run ios            # build + sync + abre o Xcode (Run ▶ no simulador ou no iPhone)
npm run android:dev    # build + sync + abre o Android Studio (API em http)
```

- **API:** o app nativo usa `src/environments/environment.prod.ts` no build de produção e `environment.ts` no de desenvolvimento. Dispositivo físico e emulador Android não enxergam `localhost`: use o IP da máquina (emulador Android: `10.0.2.2`) ou a URL do Render.
- **CORS:** a API precisa aceitar `capacitor://localhost` (iOS) e `https://localhost` / `http://localhost` (Android) em `CORS_ORIGIN`.
- **Android:** o Gradle exige Java 21. Se o terminal tiver outra versão, use o JDK do Android Studio: `JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`.
- **Convites:** preencha `webUrl` em `environment.prod.ts` com o endereço público do app web, senão o convite enviado do app nativo leva só o código.
- **Ícone e splash:** gerados a partir de `app/resources/`. Se mudar a arte, rode `npm run assets` (precisa liberar o script do `sharp` no npm).
- **Lojas:** troque o `appId` (`app.kitty.mobile`) em `capacitor.config.ts` pelo seu, antes de publicar.
