import { execSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import nwbuild, { type Options, type SupportedPlatform } from "nw-builder";

enum Platform {
  Linux = "linux",
  Windows = "win",
}

const WinAppConfig: Options<SupportedPlatform>["app"] = {
  name: "Candy Crush",
  company: "Candy Crush",
  fileDescription: "Candy Crush",
  fileVersion: "0.0.0",
  internalName: "Candy Crush",
  originalFilename: "candy-crush.exe",
  productName: "Candy Crush",
  productVersion: "0.0.0",
  icon: "./res/icon.ico",
};

const LinuxAppConfig: Options<SupportedPlatform>["app"] = {
  name: "Candy Crush",
  genericName: "Candy Crush",
  comment: "Candy Crush",
  icon: "./res/icon.png",
  categories: ["Game"],
  terminal: false,
};

const build = async <P extends SupportedPlatform>(
  platform: P,
  arch: Options["arch"],
): Promise<void> => {
  try {
    execSync("pnpm run build", { stdio: "inherit" });
    cpSync("package.json", "dist/package.json");
    rmSync("cache", { recursive: true, force: true });

    const options: Options<P> = {
      srcDir: "dist",
      mode: "build",
      version: "stable",
      flavor: "normal",
      platform,
      arch,
      outDir: `release/${platform}-${arch}`,
      cacheDir: "cache",
      downloadUrl: "https://dl.nwjs.io",
      glob: false,
      logLevel: "info",
      app: getPlatformAppConfig(platform),
    };

    await nwbuild(options);
  } catch (error: unknown) {
    process.exit(1);
  }
};

const getPlatformAppConfig = <P extends SupportedPlatform>(
  platform: P,
): Options<P>["app"] => {
  if (platform === Platform.Windows) return WinAppConfig as Options<P>["app"];
  if (platform === Platform.Linux) return LinuxAppConfig as Options<P>["app"];
  throw new Error(`Unsupported platform: '${platform}'.`);
};

const platform: string = process.argv[2];
const architecture: string = process.argv[3];
if (!platform || !architecture) process.exit(1);

await build(platform as SupportedPlatform, architecture as Options["arch"]);
