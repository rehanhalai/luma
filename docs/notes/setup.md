used this command to setup a turborepo project with Nest and Next based app

```
pnpm dlx create-turbo@latest --example https://github.com/vercel/turborepo/tree/main/examples/with-nestjs
```

since we don't need NextJS we will remove that app and install the ReactJS app instead.
delete the old nextjs app

```
rm -rf apps/web
```

inside the luma project directory, use this command to install react with TS and some pre-built configs

```
pnpm create vite apps/web --template react-ts
```

inside apps/web :
for shadcn ui / phaser / tailwind

```
pnpm dlx shadcn@latest apply --preset b3rnTxmR16

pnpm add -D tailwindcss @tailwindcss/vite

pnpm add phaser
```
