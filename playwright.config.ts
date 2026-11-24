import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',workers:1,timeout:45000,use:{baseURL:'http://localhost:3000',channel:'chrome',trace:'retain-on-failure'},webServer:{command:'pnpm dev --hostname 127.0.0.1',url:'http://localhost:3000',reuseExistingServer:true,timeout:120000}});
