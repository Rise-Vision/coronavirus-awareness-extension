#!/usr/bin/env node

const program = require('commander');
const fs = require("fs");

const spawnSync = require("child_process").spawnSync;

function utf8() {return {encoding: "utf8"};}
const manifestFilePath = "src/manifest.json";

program
  .version('0.0.1')
  .option('-i, --increment-version', 'Increment the packaged app version on manifest.json', incrementVersion)
  .option('-p, --publish', 'Upload dist/app.zip and publish it to Chrome Web Store', publish)
  .parse(process.argv);

function incrementVersion() {
  const d = new Date();
  const manifest = JSON.parse(fs.readFileSync(manifestFilePath, {encoding: "utf8"}));
  const dayMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  const dayPct = dayMinutes / 1440;

  function partToString(part) { return part.toString().padStart(2, '0') }
  const patch = parseInt(((dayPct) + "").split(".")[1].substr(0,4)) + 1000;
  manifest.version = (d.getUTCFullYear()) + "." + partToString(d.getUTCMonth() + 1) + "." +  partToString(d.getUTCDate()) + "." + patch;

  const publishVersion = manifest.version;

  if (process.env.NODE_ENV !== 'production') {
    manifest.name = `${manifest.name} Beta`;
  }

  console.log(`Writing app name "${manifest.name}" and version ${publishVersion} to manifest.json`);

  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2), {encoding: "utf8"});

  fs.writeFileSync("./latest-version", manifest.version)
}

function publish() {
  const credentialsPath = "private-keys/coronavirus-tips/credentials.json";
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, utf8()));

  // const appId = "konbgoghafhpdebefnmcbbmbgoakjfkp"; //Rise Vision Developer
  const appId = "onfcnahfkomboddiolhdplplkieeheen"; // Rise Vision Chrome Web Store - Test
  // (process.env.NODE_ENV === 'production') ? credentials.production_app_id : credentials.beta_app_id;

  const accessTokenRequest = spawnSync("curl", ["--data",
  "client_id=" + credentials.client_id +
  "&client_secret=" + credentials.client_secret +
  "&refresh_token=" + credentials.refresh_token +
  "&grant_type=refresh_token",
  "https://www.googleapis.com/oauth2/v4/token"], utf8());

  console.log(accessTokenRequest.stdout.toString());
  if (["FAILURE", "error"].some(el=>accessTokenRequest.stdout.toString().includes(el))) {
    process.exit(1);
  }

  const accessToken = JSON.parse(accessTokenRequest.stdout).access_token;

  console.log("Uploading...");

  const chromeWebStoreUploadRequest = spawnSync("curl", [
  "-H", "Authorization: Bearer " + accessToken,
  "-H", "x-goog-api-version: 2",
  "-X", "PUT",
  "-T", "package.zip",
  "-vv",
  "https://www.googleapis.com/upload/chromewebstore/v1.1/items/" + appId]);

  console.log(chromeWebStoreUploadRequest.stdout.toString());

  if (["FAILURE", "error"].some(el=>chromeWebStoreUploadRequest.stdout.toString().includes(el))) {
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestFilePath, {encoding: "utf8"}));
  console.log("Publishing version " + manifest.version);

  const chromeWebStorePublishRequest = spawnSync("curl", [
  "-H", "Authorization: Bearer " + accessToken,
  "-H", "x-goog-api-verison: 2",
  "-H", "Content-Length: 0",
  "-H", "publishTarget: trustedTesters",
  "-X", "POST",
  "-vv",
  "-fail",
  "https://www.googleapis.com/chromewebstore/v1.1/items/" + appId + "/publish"]);

  console.log(chromeWebStorePublishRequest.stdout.toString());
  process.exit(chromeWebStorePublishRequest.status);
}
