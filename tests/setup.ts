import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= "test0000";
process.env.NEXT_PUBLIC_SANITY_DATASET ??= "production";
process.env.SANITY_API_READ_TOKEN ??= "sanity-read-token-for-tests";
process.env.CONTENT_SOURCE ??= "fixtures";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
