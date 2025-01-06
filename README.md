# cuentas

personal finance app made with React Native and Deno

# setup

```bash
# app
cp cuentas/.env.example cuentas/.env

# server
cp backend/.env.example backend/.env
# EXPO_PUBLIC_API_URL should be the local ip but it can't be localhost or 127.0.0.1
```

# install

```bash
cd ./cuentas && npm install
```

# run

## app

```bash
cd ./cuentas && npm install
npx expo start
```

## server

```bash
cd ./backend && deno task dev
```
