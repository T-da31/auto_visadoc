// このモジュールの public-api。他モジュールは必ずこのファイル経由で参照し、
// gaikokujinzai.service.ts 等の内部ファイルへ直接importしないこと
// （.dependency-cruiser.cjs で機械的に検知される）。
export { GaikokujinzaiModule } from "./gaikokujinzai.module";
export { GaikokujinzaiService } from "./gaikokujinzai.service";
