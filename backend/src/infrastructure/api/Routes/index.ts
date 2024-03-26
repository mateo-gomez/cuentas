import { path, Router } from "../../../../deps.ts";

const dirPath = path.dirname(path.fromFileUrl(import.meta.url));
const router = new Router();

for await (const dirEntry of Deno.readDir(dirPath)) {
  if (dirEntry.name !== "index.ts") {
    const filePath = `${dirPath}/${dirEntry.name}`;
    const routerFile = await import(filePath);
    const routes: Router = routerFile.default;

    router.use(routes.routes());
    router.use(routes.allowedMethods());
  }
}

export default router;
